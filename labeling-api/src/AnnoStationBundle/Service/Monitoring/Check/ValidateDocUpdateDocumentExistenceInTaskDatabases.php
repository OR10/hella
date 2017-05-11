<?php

namespace AnnoStationBundle\Service\Monitoring\Check;

use ZendDiagnostics\Check;
use ZendDiagnostics\Result;
use ZendDiagnostics\Result\ResultInterface;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\TaskDatabaseValidateDocUpdateDocumentService;
use AppBundle\Model;
use GuzzleHttp;
use GuzzleHttp\Pool;
use GuzzleHttp\Psr7\Request;

class ValidateDocUpdateDocumentExistenceInTaskDatabases implements Check\CheckInterface
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
    private $invalidValidateFunctions = [];

    /**
     * @var array
     */
    private $missingValidateDocUpdateDocuments = [];

    /**
     * @var null|string
     */
    private $lastMissingValidateDocUpdateDocument = null;

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

        if (!empty($this->invalidValidateFunctions())) {
            return $this->getInvalidValidateFunctionFailureResponseForMissingDatabases();
        }

        $this->hasCheckTimeoutOccurred();

        $this->executeConcurrentRequests($this->missingValidateDocUpdateDocuments);

        if ($this->hasMissingValidateDocDocuments()) {
            return $this->getFailureResponseForMissingValidateDocUpdateDoc();
        }

        return new Result\Success();
    }

    private function invalidValidateFunctions()
    {
        $this->buildUrls();
        $this->executeConcurrentRequests($this->urls);

        return $this->invalidValidateFunctions;
    }

    private function hasCheckTimeoutOccurred()
    {
        $diff = $this->lastMissingValidateDocUpdateDocument - time();
        if ($this->hasMissingValidateDocDocuments() && $diff < 10 && $diff > 0) {
            sleep($diff - time());
        }
    }

    private function hasMissingValidateDocDocuments()
    {
        return !empty($this->missingValidateDocUpdateDocuments);
    }

    private function buildUrls()
    {
        $this->urls = array_map(
            function (Model\LabelingTask $task) {
                $database = $this->taskDatabaseCreator->getDatabaseName($task->getProjectId(), $task->getId());

                return [
                    'database' => $database,
                    'url'      => $this->getCouchDbValidateDocUpdateUrl($database),
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
        $this->missingValidateDocUpdateDocuments = [];
        $this->invalidValidateFunctions          = [];

        $pool = new Pool(
            $this->guzzleClient, $this->requestIterator($urls), [
                'concurrency' => 32,
                'fulfilled'   => function (GuzzleHttp\Psr7\Response $response, $index) use (&$invalidValidateFunctions
                ) {
                    if (!$this->isValidateDocUpdateDocumentResponseValid($response)) {
                        $this->invalidValidateFunctions[] = $this->urls[$index];
                    }
                },
                'rejected'    => function ($reason, $index) {
                    $this->missingValidateDocUpdateDocuments[]  = $this->urls[$index];
                    $this->lastMissingValidateDocUpdateDocument = time();
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
    private function isValidateDocUpdateDocumentResponseValid(GuzzleHttp\Psr7\Response $response)
    {
        $expectedDesignDoc = new TaskDatabaseValidateDocUpdateDocumentService\ValidateDocUpdateDocument();

        $validateDocUpdateDocument = \json_decode(
            $response->getBody()->getContents(),
            true
        );

        return $expectedDesignDoc->getData()['validate_doc_update'] === $validateDocUpdateDocument['validate_doc_update'];
    }

    /**
     * @return Result\Failure
     */
    private function getInvalidValidateFunctionFailureResponseForMissingDatabases()
    {
        return new Result\Failure(
            sprintf(
                'Invalid validate_doc_update function: %s',
                join(
                    ',',
                    array_map(
                        function ($url) {
                            return $url['database'];
                        },
                        $this->invalidValidateFunctions
                    )
                )
            )
        );
    }

    /**
     * @return Result\Failure
     */
    private function getFailureResponseForMissingValidateDocUpdateDoc()
    {
        return new Result\Failure(
            sprintf(
                'Missing validate_doc_update documents in: %s',
                join(
                    ',',
                    array_map(
                        function ($url) {
                            return $url['database'];
                        },
                        $this->missingValidateDocUpdateDocuments
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
        return 'validate_doc_update document check';
    }

    /**
     * @param $database
     *
     * @return string
     */
    private function getCouchDbValidateDocUpdateUrl($database)
    {
        return sprintf(
            'http://%s:%s@%s:%s/%s/_design/validation',
            $this->couchAuthUser,
            $this->couchAuthPassword,
            $this->couchHost,
            $this->couchPort,
            $database
        );
    }
}