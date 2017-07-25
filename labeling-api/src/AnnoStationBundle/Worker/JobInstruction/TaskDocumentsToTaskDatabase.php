<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service\ProjectDeleter as ProjectDeleterService;
use AnnoStationBundle\Worker\Jobs;
use Hagl\WorkerPoolBundle;
use AppBundle\Model;
use AnnoStationBundle\Command;
use AppBundle\Service;
use AnnoStationBundle\Service as AnnoStationService;
use Symfony\Component\Console;
use Symfony\Component\Console\Helper\ProgressBar;
use GuzzleHttp;
use GuzzleHttp\Psr7;
use GuzzleHttp\Exception\RequestException;
use Doctrine\ODM\CouchDB;
use Psr\Http\Message\ResponseInterface;
use AppBundle\Migration;

class TaskDocumentsToTaskDatabase extends WorkerPoolBundle\JobInstruction
{
    /**
     * @var Service\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    /**
     * @var Service\CouchDbReplicatorService
     */
    private $couchDbReplicatorService;

    /**
     * @var AnnoStationService\TaskDatabaseCreator
     */
    private $taskDatabaseCreator;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var
     */
    private $username;

    /**
     * @var
     */
    private $password;

    /**
     * @var
     */
    private $host;

    /**
     * @var
     */
    private $port;

    /**
     * @var
     */
    private $mainDatabase;

    /**
     * @var array
     */
    private $projectCache = [];

    /**
     * @var Migration\Multi
     */
    private $migrationConfiguration;

    /**
     * TaskDocumentsToTaskDatabase constructor.
     *
     * @param Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Service\CouchDbReplicatorService       $couchDbReplicatorService
     * @param AnnoStationService\TaskDatabaseCreator $taskDatabaseCreator
     * @param Facade\LabelingTask                    $labelingTaskFacade
     * @param Facade\LabeledThing                    $labeledThingFacade
     * @param Facade\LabeledThingInFrame             $labeledThingInFrameFacade
     * @param Facade\LabeledFrame                    $labeledFrameFacade
     * @param Facade\LabeledThingGroup               $labeledThingGroupFacade
     * @param Facade\Project                         $projectFacade
     * @param CouchDB\DocumentManager                $documentManager
     * @param GuzzleHttp\Client                      $guzzleClient
     * @param Migration\Configuration                $migrationConfiguration
     * @param                                        $username
     * @param                                        $password
     * @param                                        $host
     * @param                                        $port
     * @param                                        $mainDatabase
     */
    public function __construct(
        Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\CouchDbReplicatorService $couchDbReplicatorService,
        AnnoStationService\TaskDatabaseCreator $taskDatabaseCreator,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledFrame $labeledFrameFacade,
        Facade\LabeledThingGroup $labeledThingGroupFacade,
        Facade\Project $projectFacade,
        CouchDB\DocumentManager $documentManager,
        GuzzleHttp\Client $guzzleClient,
        Migration\Configuration $migrationConfiguration,
        $username,
        $password,
        $host,
        $port,
        $mainDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->couchDbReplicatorService       = $couchDbReplicatorService;
        $this->taskDatabaseCreator            = $taskDatabaseCreator;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
        $this->labeledFrameFacade             = $labeledFrameFacade;
        $this->labeledThingGroupFacade        = $labeledThingGroupFacade;
        $this->projectFacade                  = $projectFacade;
        $this->documentManager                = $documentManager;
        $this->guzzleClient                   = $guzzleClient;
        $this->migrationConfiguration         = $migrationConfiguration->getMigrations();
        $this->username                       = $username;
        $this->password                       = $password;
        $this->host                           = $host;
        $this->port                           = $port;
        $this->mainDatabase                   = $mainDatabase;
    }

    /**
     * @param WorkerPool\Job             $job
     * @param Logger\Facade\LoggerFacade $loggerFacade
     */
    protected function runJob(WorkerPool\Job $job, Logger\Facade\LoggerFacade $loggerFacade)
    {
        $task = $this->labelingTaskFacade->find($job->getTaskId());

        $project = $this->getProjectForTask($task);
        try {
            $this->taskDatabaseCreator->createDatabase($project, $task);
        } catch (\Exception $exception) {
            //database is already there
        }

        $documentIds = array_merge(
            $this->getTaskTimersDocumentIds($task),
            $this->getLabeledThingsDocumentIds($task),
            $this->getLabeledThingsInFramesDocumentIds($task),
            $this->getLabeledThingGroupsDocumentIds($task),
            $this->getLabeledFramesDocumentIds($task)
        );
        $this->moveDocuments($documentIds, $task);
    }

    private function getProjectForTask(Model\LabelingTask $task)
    {
        if (!isset($this->projectCache[$task->getProjectId()])) {
            $this->projectCache[$task->getProjectId()] = $this->projectFacade->find($task->getProjectId());
        }

        return $this->projectCache[$task->getProjectId()];
    }

    private function getTaskTimersDocumentIds(Model\LabelingTask $task)
    {
        $timers = $this->labelingTaskFacade->getTaskTimerByTask($task);

        return array_map(
            function (Model\TaskTimer $taskTimer) {
                return $taskTimer->getId();
            },
            $timers
        );
    }

    private function getLabeledThingsDocumentIds(Model\LabelingTask $task)
    {
        $labeledThings = $this->labeledThingFacade->findByTaskId($task);

        return array_map(
            function (Model\LabeledThing $labeledThing) {
                return $labeledThing->getId();
            },
            $labeledThings
        );
    }

    private function getLabeledThingsInFramesDocumentIds(Model\LabelingTask $task)
    {
        $labeledThingsInFrames = $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task);

        return array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) {
                return $labeledThingInFrame->getId();
            },
            $labeledThingsInFrames
        );
    }

    private function getLabeledThingGroupsDocumentIds(Model\LabelingTask $task)
    {
        return $this->labeledThingGroupFacade->getLabeledThingGroupIdsByTask($task);
    }

    private function getLabeledFramesDocumentIds(Model\LabelingTask $task)
    {
        $labeledFrames = $this->labeledFrameFacade->findBylabelingTask($task);

        return array_map(
            function (Model\LabeledFrame $labeledFrame) {
                return $labeledFrame->getId();
            },
            $labeledFrames
        );
    }

    private function moveDocuments(
        $documentIds,
        Model\LabelingTask $task
    ) {
        $databaseName = $this->taskDatabaseCreator->getDatabaseName($task->getProjectId(), $task->getId());

        $urls = array_map(
            function ($documentId) {
                return [
                    'url'        => sprintf(
                        'http://%s:%s@%s:%s/%s/%s',
                        $this->username,
                        $this->password,
                        $this->host,
                        $this->port,
                        $this->mainDatabase,
                        $documentId
                    ),
                    'documentId' => $documentId,
                ];
            },
            $documentIds
        );

        $pool = new GuzzleHttp\Pool(
            $this->guzzleClient, $this->requestIterator($urls), [
                'concurrency' => 10,
                'fulfilled'   => function ($response, $index) use ($databaseName, $urls) {
                    $content = json_decode($response->getBody()->getContents(), true);
                    $this->putDocument($databaseName, $urls[$index]['documentId'], $content);
                },
            ]
        );

        $promise = $pool->promise();
        $promise->wait();
    }

    private function requestIterator($urls)
    {
        foreach ($urls as $index => $url) {
            yield new Psr7\Request('GET', $url['url']);
        }
    }

    private function putDocument($databaseName, $documentId, $content)
    {
        $revision = $content['_rev'];
        unset($content['_rev']);
        $promise = $this->guzzleClient->requestAsync(
            'PUT',
            sprintf(
                'http://%s:%s@%s:%s/%s/%s',
                $this->username,
                $this->password,
                $this->host,
                $this->port,
                $databaseName,
                $documentId
            ),
            ['json' => $this->migrationConfiguration->migrate($content)]
        );
        $promise->then(
            function (ResponseInterface $res) use ($documentId, $revision) {
                $this->deleteDocument($documentId, $revision);
            }
        );
    }

    private function deleteDocument($documentId, $revision)
    {
        $promise = $this->guzzleClient->requestAsync(
            'DELETE',
            sprintf(
                'http://%s:%s@%s:%s/%s/%s?rev=%s',
                $this->username,
                $this->password,
                $this->host,
                $this->port,
                $this->mainDatabase,
                $documentId,
                $revision
            )
        );

        $promise->then(
            function (ResponseInterface $res) {
            }
        );
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\TaskDocumentsToTaskDatabase;
    }
}
