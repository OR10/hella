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

class ProjectToProjectTaskMover extends Base
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
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Facade\Project $projectFacade
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade
    ) {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->projectFacade = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:ProjectToProjectTaskMover')
            ->setDescription('Move all tasks from source project to destination project')
            ->addArgument('sourceUuid', Input\InputArgument::REQUIRED, 'Project source UUID')
            ->addArgument('destinationUuid', Input\InputArgument::REQUIRED, 'Project destination UUID');

    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $sourceUuid         = $input->getArgument('sourceUuid');
        $destinationUuid    = $input->getArgument('destinationUuid');
        $sourceProject      = $this->projectFacade->find($sourceUuid);
        $destinationProject = $this->projectFacade->find($destinationUuid);


        $tasks = $this->projectFacade->getTasksByProject($sourceProject);
        $progress = new ProgressBar($output, count($tasks));

        /** @var Model\LabelingTask $task */
        foreach ($tasks as $task) {
            $task->setProjectId($destinationProject->getId());
            $this->labelingTaskFacade->save($task);
            $progress->advance();
        }
        $progress->finish();
    }
}
