<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Symfony\Component\Console;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;

class SetMissingProjectIdsToLabeledThingInFrames extends Command\Base
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var array
     */
    private $documentsToUpdate = [];

    /**
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param CouchDB\DocumentManager    $documentManager
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade,
        CouchDB\DocumentManager $documentManager
    ) {
        parent::__construct();
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->documentManager           = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:migrate:set-missing-project-id-to-labeled-thing-in-frame');
        $this->addOption('dry-run', null, Console\Input\InputOption::VALUE_NONE, "Don't actually change anything.");
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $this->writeSection($output, 'Set missing projectId to all LabeledThingInFrames and LabeledThings');
        $dryRun = $input->getOption('dry-run');

        if ($dryRun) {
            $this->writeInfo($output, 'This is a dry run');
        }

        $this->writeInfo($output, 'Getting task -> Project cache');
        $tasks          = $this->labelingTaskFacade->findAll();
        $projectByTasks = [];
        foreach ($tasks as $task) {
            $projectByTasks[$task->getId()] = $task->getProjectId();
        }

        while(true) {
            $this->writeInfo($output, 'Getting next document batch');
            $documentManager = $this->documentManager
                ->createQuery('tmp_annostation_labeled_thing_in_frame_or_labeled_thing_without_project', 'view')
                ->setLimit(20000)
                ->onlyDocs(true);

            $documentsWithoutProject = $documentManager->execute()->toArray();

            if (count($documentManager) === 0) {
                break;
            }

            $progress = new ProgressBar($output, count($documentsWithoutProject));

            foreach ($documentsWithoutProject as $documentWithoutProject) {
                if (!isset($projectByTasks[$documentWithoutProject->getTaskId()])) {
                    continue;
                }
                $projectId = $projectByTasks[$documentWithoutProject->getTaskId()];

                /*
                $this->writeInfo(
                    $output,
                    sprintf('[%s]: %s', $documentWithoutProject->getId(), $projectId)
                );
                */

                if (!$dryRun) {
                    $documentWithoutProject->setProjectId($projectId);
                    $this->addDocumentToUpdateToBatch($documentWithoutProject, count($documentsWithoutProject));
                }

                $progress->advance();
            }
            $progress->finish();
        }
    }

    private function addDocumentToUpdateToBatch($labeledThingInFrame, $max)
    {
        $this->documentsToUpdate[] = $labeledThingInFrame;

        if (count($this->documentsToUpdate) >= 1000 || $max <= 1000) {

            foreach($this->documentsToUpdate as $document) {
                $this->documentManager->persist($document);
            }
            $this->documentManager->flush();
            $this->documentsToUpdate = [];
        }
    }
}
