<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;

class SetMissingLabelingTaskIdToLabeledThingGroups extends Command\Base
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    /**
     * @var array
     */
    private $updatedLabeledThingGroups = [];

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @param Facade\LabeledThing      $labeledThingFacade
     * @param Facade\LabeledThingGroup $labeledThingGroupFacade
     * @param CouchDB\DocumentManager  $documentManager
     */
    public function __construct(
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingGroup $labeledThingGroupFacade,
        CouchDB\DocumentManager $documentManager
    ) {
        parent::__construct();
        $this->labeledThingFacade      = $labeledThingFacade;
        $this->labeledThingGroupFacade = $labeledThingGroupFacade;
        $this->documentManager         = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:migrate:set-missing-task-id-to-labeled-thing-group');
        $this->addOption('dry-run', null, Console\Input\InputOption::VALUE_NONE, "Don't actually change anything.");
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $this->writeSection($output, 'Set missing taskId to all LabeledThingGroups');
        $dryRun = $input->getOption('dry-run');

        if ($dryRun) {
            $this->writeInfo($output, 'This is a dry run');
        }

        $labeledThings = $this->labeledThingFacade->findAll();
        $this->documentManager->clear();
        $progress      = new ProgressBar($output, count($labeledThings));
        $progress->setFormat(
            "%current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% [Updated LabeledThingGroups: %updatedLabeledThingGroups%]"
        );

        foreach ($labeledThings as $labeledThing) {
            foreach ($labeledThing->getGroupIds() as $groupId) {
                if (!in_array($groupId, $this->updatedLabeledThingGroups)) {
                    if (!$dryRun) {
                        $labeledThingGroup = $this->labeledThingGroupFacade->find($groupId);
                        $labeledThingGroup->setTaskId($labeledThing->getTaskId());
                        $this->labeledThingGroupFacade->save($labeledThingGroup);
                        $this->documentManager->clear();
                    }
                    $this->updatedLabeledThingGroups[] = $groupId;
                    $progress->setMessage(count($this->updatedLabeledThingGroups), 'updatedLabeledThingGroups');
                }
            }
            $progress->advance();
        }
        $progress->finish();

        $this->writeInfo($output, 'Done!');
    }
}
