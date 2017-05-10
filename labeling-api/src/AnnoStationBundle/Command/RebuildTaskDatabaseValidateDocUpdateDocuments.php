<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use crosscan\WorkerPool\AMQP;
use AnnoStationBundle\Worker\Jobs;

class RebuildTaskDatabaseValidateDocUpdateDocuments extends Base
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
        $this->setName('annostation:rebuild-task-database-validate-doc-update-documents')
            ->setDescription('Rebuild all validate_doc_update documents for all task databases')
            ->addArgument(
                'projectId',
                Input\InputArgument::OPTIONAL,
                'Rebuild validate_doc_update documents for a given project only.'
            );
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $projectId = $input->getArgument('projectId');
        if ($projectId === null) {
            $labelingTasks = $this->labelingTaskFacade->findAll();
        } else {
            $project = $this->projectFacade->find($projectId);
            $labelingTasks = $this->labelingTaskFacade->findAllByProject($project, true);
        }
        $numberOfLabelingTasks = count($labelingTasks);
        $progress = new ProgressBar($output, $numberOfLabelingTasks);
        $output->writeln('<info>Adding ' . $numberOfLabelingTasks . ' RabbitMQ jobs to rebuild validate_doc_update docs</info>');

        /** @var Model\LabelingTask $task */
        foreach ($labelingTasks as $labelingTask) {
            $this->amqpFacade->addJob(
                new Jobs\TaskDatabaseValidateDocUpdateRebuilder($labelingTask->getProjectId(), $labelingTask->getId())
            );
            $progress->advance();
        }
        $progress->finish();
    }
}