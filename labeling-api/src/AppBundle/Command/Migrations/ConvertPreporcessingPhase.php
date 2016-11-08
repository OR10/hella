<?php

namespace AppBundle\Command\Migrations;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;
use AppBundle\Command;

class ConvertPreporcessingPhase extends Command\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade
    ) {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:ConvertPreporcessingPhase')
            ->setDescription('Convert all tasks to the new preprocessing phase');

    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $tasks = $this->labelingTaskFacade->findAll();
        $progress = new ProgressBar($output, count($tasks));

        /** @var Model\LabelingTask $task */
        foreach ($tasks as $task) {
            if ($task->getStatus(Model\LabelingTask::PHASE_LABELING) === 'preprocessing') {
                $task->setStatus(
                    Model\LabelingTask::PHASE_PREPROCESSING,
                    Model\LabelingTask::STATUS_TODO
                );
                $task->setStatus(
                    Model\LabelingTask::PHASE_LABELING,
                    Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION
                );
                $output->writeln('<comment>Todo</comment> [' . $task->getId() . ']');
            } else {
                $task->setStatus(
                    Model\LabelingTask::PHASE_PREPROCESSING,
                    Model\LabelingTask::STATUS_DONE
                );
                $output->writeln('<info>Done</info> [' . $task->getId() . ']');
            }
            try {
                $this->labelingTaskFacade->save($task);
            } catch (\Exception $exception) {
                $output->writeln('<error>Failed to merge</error> [' . $task->getId() . ']');
            }
            $progress->advance();
        }
        $progress->finish();
    }
}
