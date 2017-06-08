<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool;

class TaskDocumentsToTaskDatabase extends Command\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var WorkerPool\Facade
     */
    private $workerPoolFacade;

    /**
     * TaskDocumentsToTaskDatabase constructor.
     *
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param WorkerPool\Facade   $workerPoolFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade, WorkerPool\Facade $workerPoolFacade)
    {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->workerPoolFacade   = $workerPoolFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:task-documents-to-task-database');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $tasks = $this->labelingTaskFacade->findAll();

        foreach ($tasks as $task) {
            $this->workerPoolFacade->addJob(new Jobs\TaskDocumentsToTaskDatabase($task->getId()));
        }
    }
}