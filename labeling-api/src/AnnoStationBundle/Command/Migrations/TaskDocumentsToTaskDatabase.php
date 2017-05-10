<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AnnoStationBundle\Service as AnnoStationService;
use Symfony\Component\Console;
use Symfony\Component\Console\Helper\ProgressBar;
use GuzzleHttp;
use GuzzleHttp\Psr7;
use GuzzleHttp\Exception\RequestException;
use Doctrine\ODM\CouchDB;
use Psr\Http\Message\ResponseInterface;

class TaskDocumentsToTaskDatabase extends Command\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    /**
     * @var AnnoStationService\TaskDatabaseCreator
     */
    private $taskDatabaseCreator;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Service\CouchDbReplicatorService
     */
    private $couchDbReplicatorService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var GuzzleHttp\Client
     */
    private $guzzleClient;

    /**
     * @var string
     */
    private $host;

    /**
     * @var string
     */
    private $port;

    /**
     * @var string
     */
    private $username;

    /**
     * @var string
     */
    private $password;

    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    /**
     * @var string
     */
    private $mainDatabase;

    /**
     * @var int
     */
    private $movedDocs = 0;
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var array
     */
    private $projectCache = [];

    /**
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
     * @param string                                 $username
     * @param string                                 $password
     * @param string                                 $host
     * @param string                                 $port
     * @param string                                 $mainDatabase
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
        $username,
        $password,
        $host,
        $port,
        $mainDatabase
    ) {
        parent::__construct();
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->couchDbReplicatorService       = $couchDbReplicatorService;
        $this->taskDatabaseCreator            = $taskDatabaseCreator;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
        $this->projectFacade                  = $projectFacade;
        $this->guzzleClient                   = $guzzleClient;
        $this->username                       = $username;
        $this->password                       = $password;
        $this->host                           = $host;
        $this->port                           = $port;
        $this->labeledFrameFacade             = $labeledFrameFacade;
        $this->labeledThingGroupFacade        = $labeledThingGroupFacade;
        $this->mainDatabase                   = $mainDatabase;
        $this->documentManager                = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:task-documents-to-task-database');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $tasks = $this->labelingTaskFacade->findAll();

        $progress = new ProgressBar($output, count($tasks));
        $progress->setFormat(
            "%current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s% CurrentTaskId: %taskId% MovedDocs: %movedDocs%"
        );

        foreach ($tasks as $task) {
            $progress->setMessage($task->getId(), 'taskId');
            $project = $this->getProjectForTask($task);
            try {
                $this->taskDatabaseCreator->createDatabase($project, $task);
            } catch (\Exception $exception) {
                $databaseName = $this->taskDatabaseCreator->getDatabaseName($project->getId(), $task->getId());
                $this->writeInfo($output, 'Failed to create Database: ' . $databaseName);
            }

            $documentIds = array_merge(
                $this->getTaskTimersDocumentIds($task),
                $this->getLabeledThingsDocumentIds($task),
                $this->getLabeledThingsInFramesDocumentIds($task),
                $this->getLabeledThingGroupsDocumentIds($task),
                $this->getLabeledFramesDocumentIds($task)
            );
            $this->moveDocuments($documentIds, $task, $progress, $output);
            $this->documentManager->clear();

            $progress->advance();
        }
        $progress->finish();
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
        Model\LabelingTask $task,
        ProgressBar $progress,
        Console\Output\OutputInterface $output
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
                'fulfilled'   => function ($response, $index) use ($databaseName, $urls, $progress, $output) {
                    $content = json_decode($response->getBody()->getContents(), true);
                    $this->putDocument($databaseName, $urls[$index]['documentId'], $content, $output);
                    $progress->setMessage($this->movedDocs++, 'movedDocs');
                },
                'rejected'    => function ($reason, $index) use ($urls, $output) {
                    $this->writeInfo(
                        $output,
                        sprintf(
                            'Failed <comment>get</comment> document <comment>%s</comment>',
                            $urls[$index]['documentId']
                        )
                    );
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

    private function putDocument($databaseName, $documentId, $content, Console\Output\OutputInterface $output)
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
            ['json' => $content]
        );
        $promise->then(
            function (ResponseInterface $res) use ($documentId, $revision, $output) {
                $this->deleteDocument($documentId, $revision, $output);
            },
            function (RequestException $e) use ($output, $documentId, $databaseName) {
                $this->writeInfo(
                    $output,
                    sprintf(
                        'Failed <comment>put</comment> document <comment>%s</comment> to <comment>%s</comment>',
                        $documentId,
                        $databaseName
                    )
                );
            }
        );
    }

    private function deleteDocument($documentId, $revision, Console\Output\OutputInterface $output)
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
            },
            function (RequestException $e) use ($output, $documentId) {
                $this->writeInfo(
                    $output,
                    sprintf(
                        'Failed <comment>delete</comment> document <comment>%s</comment>',
                        $documentId
                    )
                );
            }
        );
    }
}