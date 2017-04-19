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
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Service\CouchDbReplicatorService       $couchDbReplicatorService
     * @param AnnoStationService\TaskDatabaseCreator $taskDatabaseCreator
     * @param Facade\LabelingTask                    $labelingTaskFacade
     * @param Facade\LabeledThing                    $labeledThingFacade
     * @param Facade\LabeledThingInFrame             $labeledThingInFrameFacade
     * @param Facade\Project                         $projectFacade
     */
    public function __construct(
        Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\CouchDbReplicatorService $couchDbReplicatorService,
        AnnoStationService\TaskDatabaseCreator $taskDatabaseCreator,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\Project $projectFacade
    ) {
        parent::__construct();
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->couchDbReplicatorService       = $couchDbReplicatorService;
        $this->taskDatabaseCreator            = $taskDatabaseCreator;
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledThingFacade             = $labeledThingFacade;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
        $this->projectFacade                  = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:task-documents-to-task-database');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $tasks = $this->labelingTaskFacade->findAll();

        foreach ($tasks as $task) {
            $project = $this->projectFacade->find($task->getProjectId());
            try {
                $this->taskDatabaseCreator->createDatabase($project, $task);
            } catch (\Exception $exception) {
                $databaseName = $this->taskDatabaseCreator->getDatabaseName($project->getId(), $task->getId());
                $this->writeInfo($output, 'Failed to create Database: ' . $databaseName);
            }
        }
    }
}