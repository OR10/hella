<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;

class RebuildTaskDatabaseSecurityPermissions extends Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->amqpFacade         = $amqpFacade;
        $this->projectFacade      = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:rebuild-task-database-security-permissions')
            ->setDescription('Rebuild all _security task database documents for all tasks')
            ->addArgument(
                'projectId',
                Input\InputArgument::OPTIONAL,
                'Rebuild _security permissions for a given project only.'
            );
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $projectId = $input->getArgument('projectId');
        if ($projectId === null) {
            $labelingTasks = $this->labelingTaskFacade->findAll();
        } else {
            $project       = $this->projectFacade->find($projectId);
            $labelingTasks = $this->labelingTaskFacade->findAllByProject($project, true);
        }
        $progress = new ProgressBar($output, count($labelingTasks));

        /** @var Model\LabelingTask $task */
        foreach ($labelingTasks as $labelingTask) {
            $this->amqpFacade->addJob(new Jobs\TaskDatabaseSecurityRebuilder($labelingTask->getId()));
            $progress->advance();
        }
        $progress->finish();
    }
}
