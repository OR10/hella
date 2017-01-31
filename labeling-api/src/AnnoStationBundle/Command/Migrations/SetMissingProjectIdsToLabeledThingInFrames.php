<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Symfony\Component\Console;

class SetMissingProjectIdsToLabeledThingInFrames extends Command\Base
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrame;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTask;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThing;

    /**
     * @param Facade\LabelingTask        $labelingTask
     * @param Facade\LabeledThingInFrame $labeledThingInFrame
     * @param Facade\LabeledThing        $labeledThing
     */
    public function __construct(
        Facade\LabelingTask $labelingTask,
        Facade\LabeledThingInFrame $labeledThingInFrame,
        Facade\LabeledThing $labeledThing
    ) {
        parent::__construct();
        $this->labeledThingInFrame = $labeledThingInFrame;
        $this->labelingTask        = $labelingTask;
        $this->labeledThing        = $labeledThing;
    }

    protected function configure()
    {
        $this->setName('annostation:migrate:set-missing-project-id-to-labeled-thing-in-frame');
        $this->addOption('dry-run', null, Console\Input\InputOption::VALUE_NONE, "Don't actually change anything.");
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $this->writeSection($output, 'Set missing projectId to all LabeledThingInFrames');
        $dryRun = $input->getOption('dry-run');

        if ($dryRun) {
            $this->writeInfo($output, 'This is a dry run');
        }

        $tasks = $this->labelingTask->findAll();

        foreach ($tasks as $task) {
            $projectId = $task->getProjectId();
            $labeledThingInFrames = $this->labeledThingInFrame->getLabeledThingsInFrame($task);


            $labeledThingInFramesToUpdate = [];
            foreach ($labeledThingInFrames as $labeledThingInFrame) {
                if ($labeledThingInFrame->getProjectId() === null) {
                    $this->writeInfo(
                        $output,
                        sprintf('[LTIF] [%s]: %s', $labeledThingInFrame->getId(), $projectId)
                    );
                    if (!$dryRun) {
                        $labeledThingInFrame->setProjectId($projectId);
                        $labeledThingInFramesToUpdate[] = $labeledThingInFrame;
                    }
                }

                $labeledThing = $this->labeledThing->find($labeledThingInFrame->getLabeledThingId());
                if ($labeledThing instanceOf Model\LabeledThing && $labeledThing->getProjectId() === null) {
                    $this->writeInfo(
                        $output,
                        sprintf('[LT] [%s]: %s', $labeledThing->getId(), $projectId)
                    );
                    if (!$dryRun) {
                        $labeledThing->setProjectId($projectId);
                        $this->labeledThing->save($labeledThing);
                    }
                }
            }
            $this->labeledThingInFrame->saveAll($labeledThingInFramesToUpdate);
        }
    }
}
