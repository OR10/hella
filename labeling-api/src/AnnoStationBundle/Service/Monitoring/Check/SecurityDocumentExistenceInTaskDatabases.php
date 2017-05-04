<?php

namespace AnnoStationBundle\Service\Monitoring\Check;

use ZendDiagnostics\Check;
use ZendDiagnostics\Result;
use ZendDiagnostics\Result\ResultInterface;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use GuzzleHttp;

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

        $tasks            = $this->labelingTaskFacade->findAll();
        $missingDocuments = [];
        foreach ($tasks as $task) {
            $databaseName = $this->taskDatabaseCreator->getDatabaseName($task->getProjectId(), $task->getId());

            if (!$this->isSecurityDocPresent($databaseName)) {
                $missingDocuments[] = $databaseName;
            }
        }
        if (!empty($missingDocuments)) {
            return new Result\Failure('Missing _security document in: ' . join(', ', $missingDocuments));
        }

        return new Result\Success();
    }

    /**
     * @param     $databaseName
     * @param int $retryCount
     *
     * @return bool
     */
    private function isSecurityDocPresent($databaseName, $retryCount = 0)
    {
        $request = $this->guzzleClient->request(
            'GET',
            $this->generateCouchDbSecurityUrl($databaseName)
        );

        if (empty(json_decode($request->getBody()->getContents(), true))) {
            if ($retryCount <= 10) {
                sleep(1);

                return $this->isSecurityDocPresent($databaseName, $retryCount + 1);
            } else {
                return false;
            }
        }

        return true;
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