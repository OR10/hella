<?php

namespace AnnoStationBundle\Service\Monitoring\Check;

use Psr\Http\Message\RequestInterface;
use ZendDiagnostics\Check;
use ZendDiagnostics\Result;
use ZendDiagnostics\Result\ResultInterface;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use GuzzleHttp;
use GuzzleHttp\Pool;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;

class SecurityDocumentExistenceInTaskDatabases implements Check\CheckInterface
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreator;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var
     */
    private $couchAuthUser;

    /**
     * @var
     */
    private $couchAuthPassword;

    /**
     * @var
     */
    private $couchHost;

    /**
     * @var
     */
    private $couchPort;

    /**
     * @var bool
     */
    private $pouchdbFeatureEnabled;

    /**
     * @var array
     */
    private $urls;

    /**
     * @var array
     */
    private $failedDatabases = [];

    /**
     * @var array
     */
    private $missingSecurityDocuments = [];

    /**
     * @var null|string
     */
    private $lastMissingSecurityDocument = null;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Service\TaskDatabaseCreator $taskDatabaseCreator,
        GuzzleHttp\Client $guzzleClient,
        $couchAuthUser,
        $couchAuthPassword,
        $couchHost,
        $couchPort,
        $pouchdbFeatureEnabled
    ) {
        $this->labelingTaskFacade    = $labelingTaskFacade;
        $this->taskDatabaseCreator   = $taskDatabaseCreator;
        $this->guzzleClient          = $guzzleClient;
        $this->couchAuthUser         = $couchAuthUser;
        $this->couchAuthPassword     = $couchAuthPassword;
        $this->couchHost             = $couchHost;
        $this->couchPort             = $couchPort;
        $this->pouchdbFeatureEnabled = $pouchdbFeatureEnabled;
    }

    /**
     * Perform the actual check and return a ResultInterface
     *
     * @return ResultInterface
     */
    public function check()
    {
        if (!$this->pouchdbFeatureEnabled) {
            return new Result\Skip('PouchDB not enabled');
        }

        $this->buildUrls();

        $this->executeConcurrentRequests($this->urls);

        if (!empty($this->failedDatabases)) {
            return $this->getFailureResponseForMissingDatabases();
        }

        $diff = $this->lastMissingSecurityDocument - time();
        if (!empty($this->missingSecurityDocuments) && $diff < 10 && $diff > 0) {
            sleep($diff - time());
        }
        $this->executeConcurrentRequests($this->missingSecurityDocuments);

        if (!empty($this->missingSecurityDocuments)) {
            return $this->getFailureResponseForMissingSecurityDoc();
        }

        return new Result\Success();
    }

    private function buildUrls()
    {
        $this->urls = array_map(
            function (Model\LabelingTask $task) {
                $database = $this->taskDatabaseCreator->getDatabaseName($task->getProjectId(), $task->getId());

                return [
                    'database' => $database,
                    'url'      => $this->getCouchDbSecurityUrl($database),
                ];
            },
            $this->labelingTaskFacade->findAll()
        );
    }

    /**
     * @param $urls
     */
    private function executeConcurrentRequests($urls)
    {
        $this->missingSecurityDocuments = [];
        $this->failedDatabases          = [];

        $pool = new Pool(
            $this->guzzleClient, $this->requestIterator($urls), [
                'concurrency' => 32,
                'fulfilled'   => function (GuzzleHttp\Psr7\Response $response, $index) use (&$missingSecurityDocuments
                ) {
                    if (!$this->isSecurityDocumentResponseValid($response)) {
                        $this->missingSecurityDocuments[]  = $this->urls[$index];
                        $this->lastMissingSecurityDocument = time();
                    }
                },
                'rejected'    => function ($reason, $index) use (&$failedDatabases) {
                    $this->failedDatabases[] = $this->urls[$index];
                },
            ]
        );

        // Initiate the transfers and create a promise
        $promise = $pool->promise();

        // Force the pool of requests to complete.
        $promise->wait();
    }

    /**
     * @param $urls
     *
     * @return \Generator
     */
    private function requestIterator($urls)
    {
        foreach ($urls as $index => $url) {
            yield new Request('GET', $url['url']);
        }
    }

    /**
     * @param GuzzleHttp\Psr7\Response $response
     *
     * @return bool
     */
    private function isSecurityDocumentResponseValid(GuzzleHttp\Psr7\Response $response)
    {
        $securityDocument = \json_decode(
            $response->getBody()->getContents(),
            true
        );

        return !empty($securityDocument);
    }

    /**
     * @return Result\Failure
     */
    private function getFailureResponseForMissingDatabases()
    {
        return new Result\Failure(
            sprintf(
                'Failed to get databases: %s',
                join(
                    ',',
                    array_map(
                        function ($url) {
                            return $url['database'];
                        },
                        $this->failedDatabases
                    )
                )
            )
        );
    }

    /**
     * @return Result\Failure
     */
    private function getFailureResponseForMissingSecurityDoc()
    {
        return new Result\Failure(
            sprintf(
                'Missing security documents in: %s',
                join(
                    ',',
                    array_map(
                        function ($url) {
                            return $url['database'];
                        },
                        $this->missingSecurityDocuments
                    )
                )
            )
        );
    }

    /**
     * Return a label describing this test instance.
     *
     * @return string
     */
    public function getLabel()
    {
        return '_security doc existence in all task databases';
    }

    /**
     * @param $database
     *
     * @return string
     */
    private function getCouchDbSecurityUrl($database)
    {
        return sprintf(
            'http://%s:%s@%s:%s/%s/_security',
            $this->couchAuthUser,
            $this->couchAuthPassword,
            $this->couchHost,
            $this->couchPort,
            $database
        );
    }
}