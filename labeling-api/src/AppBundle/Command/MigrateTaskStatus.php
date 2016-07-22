<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;

class MigrateTaskStatus extends Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:MigrateTaskStatus');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $tasks    = $this->labelingTaskFacade->findAll();
        $progress = new ProgressBar($output, count($tasks));

        /** @var Model\LabelingTask $task */
        foreach ($tasks as $task) {

            switch ($task->getStatus()) {
                case 'waiting':
                    if ($task->getAssignedUserId() === null) {
                        $task->setStatus(Model\LabelingTask::STATUS_TODO);
                    } else {
                        $task->setStatus(Model\LabelingTask::STATUS_IN_PROGRESS);
                    }
                    break;
                case 'labeled':
                    $task->setStatus(Model\LabelingTask::STATUS_DONE);
                    break;
            }

            $this->labelingTaskFacade->save($task);
            $progress->advance();
        }
        $progress->finish();
    }
}