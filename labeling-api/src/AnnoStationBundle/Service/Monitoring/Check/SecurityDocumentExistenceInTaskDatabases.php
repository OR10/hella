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
        $couchPort
    ) {
        $this->labelingTaskFacade  = $labelingTaskFacade;
        $this->taskDatabaseCreator = $taskDatabaseCreator;
        $this->guzzleClient        = $guzzleClient;
        $this->couchAuthUser       = $couchAuthUser;
        $this->couchAuthPassword   = $couchAuthPassword;
        $this->couchHost           = $couchHost;
        $this->couchPort           = $couchPort;
    }

    /**
     * Perform the actual check and return a ResultInterface
     *
     * @return ResultInterface
     */
    public function check()
    {
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
            function ($taskIdAndProjectId) {
                $database = $this->taskDatabaseCreator->getDatabaseName(
                    $taskIdAndProjectId['projectId'],
                    $taskIdAndProjectId['taskId']
                );

                return [
                    'database' => $database,
                    'url'      => $this->getCouchDbSecurityUrl($database),
                ];
            },
            $this->labelingTaskFacade->findTaskIdAndProjectId()
        );
    }

    /**
     * @param $urls
     */
    private function executeConcurrentRequests($urls)
    {
        $this->missingSecurityDocuments = [];
        $this->failedDatabases          = [];

        $pool = $this->createConcurrentRequestPool($urls);

        // Initiate the transfers and create a promise
        $promise = $pool->promise();

        // Force the pool of requests to complete.
        $promise->wait();
    }

    private function createConcurrentRequestPool($urls)
    {
        return new Pool(
            $this->guzzleClient, $this->requestIterator($urls), [
                'concurrency' => 32,
                'fulfilled'   => function (
                    GuzzleHttp\Psr7\Response $response,
                    $index
                ) use (
                    $urls
                ) {
                    if (!$this->isSecurityDocumentResponseValid($response)) {
                        $this->missingSecurityDocuments[]  = $urls[$index];
                        $this->lastMissingSecurityDocument = time();
                    }
                },
                'rejected'    => function ($reason, $index) use ($urls, &$failedDatabases) {
                    $this->failedDatabases[] = $urls[$index];
                },
            ]
        );
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
                $this->getDatabasesAsString($this->failedDatabases)
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
                $this->getDatabasesAsString($this->missingSecurityDocuments)
            )
        );
    }

    /**
     * @param $documents
     *
     * @return string
     */
    private function getDatabasesAsString($documents)
    {
        return join(
            ',',
            array_map(
                function ($url) {
                    return $url['database'];
                },
                $documents
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
