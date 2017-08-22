<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;
use AnnoStationBundle\Model;
use Symfony\Component\Console;
use Symfony\Component\Console\Helper;
use Doctrine\ODM\CouchDB;

class SetProjectIdToLabeledThingGroups extends Command\Base
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
        $this->setName('annostation:migrations:set-project-id-to-labeled-thing-groups');
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
            $labeledThingGroups      = array_filter(
                $labeledThingGroupFacade->getLabeledThingGroupsByTask($task),
                function (Model\LabeledThingGroup $labeledThingGroup) {
                    return $labeledThingGroup->getProjectId() === null;
                }
            );

            foreach ($labeledThingGroups as $labeledThingGroup) {
                $labeledThingGroup->setProjectId($task->getProjectId());
                $labeledThingGroupFacade->save($labeledThingGroup);

                $this->documentManager->detach($labeledThingGroup);
            }
            $progress->advance();
            $this->documentManager->detach($task);
        }
        $progress->finish();
    }
}
