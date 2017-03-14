<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AnnoStationBundle\Service as AnnoStationService;
use Symfony\Component\Console;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;

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
     * @param Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Service\CouchDbReplicatorService       $couchDbReplicatorService
     * @param AnnoStationService\TaskDatabaseCreator            $taskDatabaseCreator
     * @param Facade\LabelingTask                    $labelingTaskFacade
     * @param Facade\LabeledThing                    $labeledThingFacade
     * @param Facade\LabeledThingInFrame             $labeledThingInFrameFacade
     */
    public function __construct(
        Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\CouchDbReplicatorService $couchDbReplicatorService,
        AnnoStationService\TaskDatabaseCreator $taskDatabaseCreator,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade
    ) {
        parent::__construct();
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->couchDbReplicatorService       = $couchDbReplicatorService;
        $this->taskDatabaseCreator            = $taskDatabaseCreator;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:task-documents-to-task-database');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $tasks = $this->labelingTaskFacade->findAll();

        foreach ($tasks as $task) {
            $projectId = $task->getProjectId();
            $taskId = $task->getId();
            try {
                $this->taskDatabaseCreator->createDatabase($projectId, $taskId);
            } catch (\Exception $exception) {
                $databaseName = $this->taskDatabaseCreator->getDatabaseName($projectId, $taskId);
                $this->writeInfo($output, 'Failed to create Database: ' . $databaseName);
            }
        }
    }
}