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

class ConvertUserIntToString extends Base
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
        $this->setName('annostation:ConvertUserIntToString');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $tasks = $this->labelingTaskFacade->findAll();
        $progress = new ProgressBar($output, count($tasks));

        /** @var Model\LabelingTask $task */
        foreach ($tasks as $task) {
            if (is_int($task->getAssignedUserId())) {
                $task->setAssignedUser((string)$task->getAssignedUserId());
                $this->labelingTaskFacade->save($task);
            }
            $progress->advance();
        }
        $progress->finish();
    }
}