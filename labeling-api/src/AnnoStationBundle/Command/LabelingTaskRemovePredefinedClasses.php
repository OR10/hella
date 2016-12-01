<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use Doctrine\ODM\CouchDB;

class LabelingTaskRemovePredefinedClasses extends Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;


    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     * @internal param Facade\CalibrationData $calibrationDataFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:LabelingTaskRemovePredefinedClasses');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $tasks    = $this->labelingTaskFacade->findAll();
        $progress = new ProgressBar($output, count($tasks));

        /** @var Model\LabelingTask $task */
        foreach ($tasks as $task) {
            $task->setPredefinedClasses([]);
            $this->labelingTaskFacade->save($task);

            $progress->advance();
        }
        $progress->finish();
    }
}
