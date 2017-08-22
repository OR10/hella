<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\LabeledFrame;
use AppBundle\Model;
use Symfony\Component\Console;
use Symfony\Component\Console\Helper;
use Doctrine\ODM\CouchDB;

class SetProjectIdToLabeledFrames extends Command\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var LabeledFrame\FacadeInterface
     */
    private $labeledFrameFacadeFactory;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledFrame\FacadeInterface $labeledFrameFacadeFactory,
        CouchDB\DocumentManager $documentManager
    ) {
        parent::__construct();
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->labeledFrameFacadeFactory = $labeledFrameFacadeFactory;
        $this->documentManager = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:set-project-id-to-labeled-frames');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $tasks = $this->labelingTaskFacade->findAll();
        $progress      = new Helper\ProgressBar($output, count($tasks));
        foreach ($tasks as $task) {
            $labeledFrameFacade = $this->labeledFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $task->getProjectId(),
                $task->getId()
            );
            $labeledFrames = array_filter(
                $labeledFrameFacade->findBylabelingTask($task),
                function (Model\LabeledFrame $labeledFrame) {
                    return $labeledFrame->getProjectId() === null;
                }
            );

            $progress->start();
            foreach ($labeledFrames as $labeledFrame) {
                $labeledFrame->setProjectId($task->getProjectId());
                $labeledFrameFacade->save($labeledFrame);

                $this->documentManager->detach($labeledFrame);
                $progress->advance();
            }
            $this->documentManager->detach($task);
        }
        $progress->finish();
    }
}
