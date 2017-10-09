<?php

namespace AnnoStationBundle\Command;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Worker\Jobs;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Input\InputArgument;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;

class DeleteInvalidLtifLtAndLtgReferences extends Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        AMQP\FacadeAMQP $amqpFacade
    ) {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->amqpFacade         = $amqpFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:delete-invalid-ltif-lt-and-ltg-references')
            ->setDescription(
                'Delete all LTIF with an invalid LT reference and LT with an invalid LTG OR no assigned LTIF reference'
            )
            ->addArgument('taskId', InputArgument::OPTIONAL);
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $priority = WorkerPool\Facade::LOW_PRIO;
        if ($input->getArgument('taskId') !== null) {
            $priority = WorkerPool\Facade::HIGH_PRIO;
            $tasks = [$this->labelingTaskFacade->find($input->getArgument('taskId'))];
        } else {
            $tasks = $this->labelingTaskFacade->findAll();
        }

        foreach ($tasks as $task) {
            $job = new Jobs\DeleteInvalidLtifLtAndLtgReferences($task->getId());
            $this->amqpFacade->addJob($job, $priority);
        }
    }
}