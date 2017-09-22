<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;
use Symfony\Component\Console;
use Symfony\Component\Console\Helper;
use Doctrine\ODM\CouchDB;

class AddIdentifierNameByGroupType extends Command\Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var LabeledThingGroup\FacadeInterface
     */
    private $labeledThingGroupFacadeFactory;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledThingGroup\FacadeInterface $labeledThingGroupFacadeFactory,
        CouchDB\DocumentManager $documentManager
    ) {
        parent::__construct();
        $this->labelingTaskFacade             = $labelingTaskFacade;
        $this->labeledThingGroupFacadeFactory = $labeledThingGroupFacadeFactory;
        $this->documentManager                = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:add-identifier-name-by-group-type');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $tasks    = $this->labelingTaskFacade->findAll();
        $progress = new Helper\ProgressBar($output, count($tasks));
        $progress->start();
        foreach ($tasks as $task) {
            $labeledThingGroupFacade = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
                $task->getProjectId(),
                $task->getId()
            );

            $labeledThingGroups = $labeledThingGroupFacade->getLabeledThingGroupsByTask($task);

            foreach ($labeledThingGroups as $labeledThingGroup) {
                $labeledThingGroup->setIdentifierName($labeledThingGroup->getGroupType());
                $labeledThingGroupFacade->save($labeledThingGroup);
                $this->documentManager->detach($labeledThingGroup);
            }
            $progress->advance();
            $this->documentManager->detach($task);
        }
        $progress->finish();
    }
}
