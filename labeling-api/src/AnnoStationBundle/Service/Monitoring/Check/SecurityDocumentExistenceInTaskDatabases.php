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

        $this->urls = array_map(
            function (Model\LabelingTask $task) {
                $database = $this->taskDatabaseCreator->getDatabaseName($task->getProjectId(), $task->getId());

                return [
                    'database'  => $database,
                    'url'       => $this->generateCouchDbSecurityUrl($database),
                ];
            },
            $this->labelingTaskFacade->findAll()
        );

        $requests = function () {
            foreach ($this->urls as $index => $url) {
                yield new Request('GET', $url['url']);
            }
        };

        $failedDatabases          = [];
        $missingSecurityDocuments = [];

        $pool = new Pool(
            $this->guzzleClient, $requests(), [
                'concurrency' => 32,
                'fulfilled'   => function (GuzzleHttp\Psr7\Response $response, $index) use (&$missingSecurityDocuments) {
                    if (!$this->isSecurityDocumentResponseValid($response)) {
                        $missingSecurityDocuments[] = $this->urls[$index]['database'];
                    }
                },
                'rejected'    => function ($reason, $index) use (&$failedDatabases) {
                    $failedDatabases[] = $this->urls[$index]['database'];
                },
            ]
        );

        // Initiate the transfers and create a promise
        $promise = $pool->promise();

        // Force the pool of requests to complete.
        $promise->wait();

        if (!empty($failedDatabases)) {
            return new Result\Failure(sprintf('Failed to get databases: %s', join(',', $failedDatabases)));
        }

        if (!empty($missingSecurityDocuments)) {
            return new Result\Failure(
                sprintf('Missing security documents in: %s', join(',', $missingSecurityDocuments))
            );
        }

        return new Result\Success();
    }

    private function isSecurityDocumentResponseValid(GuzzleHttp\Psr7\Response $response)
    {
        $securityDocument = \json_decode(
            $response->getBody()->getContents(),
            true
        );

        return !empty($securityDocument);
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
    private function generateCouchDbSecurityUrl($database)
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