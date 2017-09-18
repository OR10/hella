<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;
use Doctrine\ODM\CouchDB;

class DeleteInvalidLtifLtAndLtgReferences extends Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var LabeledThing\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    /**
     * @var LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

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
        LabeledThing\FacadeInterface $labeledThingFacadeFactory,
        LabeledThingInFrame\FacadeInterface $labeledThingInFrameFacadeFactory,
        LabeledThingGroup\FacadeInterface $labeledThingGroupFacadeFactory,
        CouchDB\DocumentManager $documentManager
    ) {
        parent::__construct();
        $this->labelingTaskFacade               = $labelingTaskFacade;
        $this->labeledThingInFrameFacadeFactory = $labeledThingInFrameFacadeFactory;
        $this->labeledThingFacadeFactory        = $labeledThingFacadeFactory;
        $this->labeledThingGroupFacadeFactory   = $labeledThingGroupFacadeFactory;
        $this->documentManager                  = $documentManager;
    }

    protected function configure()
    {
        $this->setName('annostation:delete-invalid-ltif-lt-and-ltg-references')
            ->setDescription('Delete all LTIF with an invalid LT reference and LT with an invalid LTG OR no assigned LTIF reference')
            ->addArgument('logFilePath', InputArgument::REQUIRED)
            ->addArgument('taskId', InputArgument::OPTIONAL)
            ->addOption('dryRun');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $dryRun               = $input->getOption('dryRun');
        $logFilePath          = $input->getArgument('logFilePath');
        $deletedLtifDocs      = 0;
        $deletedLtgReferences = 0;
        $deletedLtDocs        = 0;

        if ($input->getArgument('taskId') !== null) {
            $tasks = [$this->labelingTaskFacade->find($input->getArgument('taskId'))];
        } else {
            $tasks = $this->labelingTaskFacade->findAll();
        }

        $progressBar          = new ProgressBar($output, count($tasks));
        $progressBar->setFormatDefinition(
            'custom',
            ' Scanning Task %current% of %max% Tasks -- [Deleted LTIFs: %deletedDocs%] [Deleted LTs: %deletedLtDocs%] [Deleted LTG References: %deletedLtgReferences%] [TaskId: %currentTask%]'
        );
        $progressBar->setFormat('custom');
        $progressBar->setMessage($deletedLtifDocs, 'deletedDocs');
        $progressBar->setMessage($deletedLtgReferences, 'deletedLtgReferences');
        $progressBar->setMessage($deletedLtDocs, 'deletedLtDocs');
        foreach ($tasks as $task) {
        $progressBar->setMessage($task->getId(), 'currentTask');
            $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $task->getProjectId(),
                $task->getId()
            );
            $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
                $task->getProjectId(),
                $task->getId()
            );

            $labeledThings        = $labeledThingFacade->findByTaskId($task);
            $deletedLtgReferences += $this->removeInvalidLabeledThingGroupReferences(
                $task,
                $labeledThings,
                $logFilePath,
                $dryRun
            );

            $labeledThingsInFrames        = $labeledThingInFrameFacade->getLabeledThingsInFrame($task);
            $invalidLabeledThingsInFrames = $this->getInvalidLabeledThingReferencesFromLabeledThingInFrames(
                $labeledThingsInFrames,
                $task->getProjectId(),
                $task->getId()
            );

            $deletedLtDocs += $this->removeLabeledThingWithoutAnyLabeledThingInFrameRelation(
                $labeledThings,
                $task,
                $logFilePath,
                $dryRun
            );

            $this->deleteLabeledThingInFrames(
                $invalidLabeledThingsInFrames,
                $task->getFrameNumberMapping(),
                $dryRun,
                $logFilePath
            );
            $deletedLtifDocs += count($invalidLabeledThingsInFrames);
            $progressBar->setMessage($deletedLtifDocs, 'deletedLtifDocs');
            $progressBar->setMessage($deletedLtgReferences, 'deletedLtgReferences');
            $progressBar->setMessage($deletedLtDocs, 'deletedLtDocs');
            $progressBar->advance();
            $this->detachObjects($labeledThings);
            $this->detachObjects($labeledThingsInFrames);
            $this->documentManager->detach($task);
            $this->documentManager->clear();
        }
    }

    /**
     * @param                    $labeledThings
     * @param Model\LabelingTask $task
     * @param                    $logFilePath
     * @param                    $dryRun
     * @return int
     */
    private function removeLabeledThingWithoutAnyLabeledThingInFrameRelation(
      $labeledThings,
      Model\LabelingTask $task,
      $logFilePath,
      $dryRun
    ){
        $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $removedLabeledThings = 0;
        foreach($labeledThings as $labeledThing) {
            if (empty($labeledThingFacade->getLabeledThingInFrames($labeledThing))) {
                file_put_contents(
                    $logFilePath,
                    sprintf(
                        "%s;%s;%s;%s;%s-%s%s",
                        'invalid_empty_lt',
                        $labeledThing->getProjectId(),
                        $labeledThing->getTaskId(),
                        $labeledThing->getId(),
                        $labeledThing->getFrameRange()->getStartFrameIndex(),
                        $labeledThing->getFrameRange()->getEndFrameIndex(),
                        "\n"
                    ),
                    FILE_APPEND
                );
                $removedLabeledThings++;
                if (!$dryRun) {
                    $labeledThingFacade->delete($labeledThing);
                }
            }
        }

        return $removedLabeledThings;
    }

    /**
     * @param Model\LabelingTask   $task
     * @param Model\LabeledThing[] $labeledThings
     * @param                      $logFilePath
     * @param                      $dryRun
     * @return int
     */
    private function removeInvalidLabeledThingGroupReferences(
        Model\LabelingTask $task,
        $labeledThings,
        $logFilePath,
        $dryRun
    ) {
        $labeledThingGroupFacade   = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        $labeledThingFacade        = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        $numberOfDeletedReferences = 0;
        foreach ($labeledThings as $labeledThing) {
            $newGroup = $labeledThing->getGroupIds();
            foreach ($labeledThing->getGroupIds() as $groupId) {

                if (!$labeledThingGroupFacade->find($groupId) instanceof AnnoStationBundleModel\LabeledThingGroup) {
                    file_put_contents(
                        $logFilePath,
                        sprintf(
                            "%s;%s;%s;%s;%s-%s%s",
                            'invalid_ltg_reference',
                            $labeledThing->getProjectId(),
                            $labeledThing->getTaskId(),
                            $labeledThing->getId(),
                            $labeledThing->getFrameRange()->getStartFrameIndex(),
                            $labeledThing->getFrameRange()->getEndFrameIndex(),
                            "\n"
                        ),
                        FILE_APPEND
                    );
                    $key = array_search($groupId, $newGroup);
                    unset($newGroup[$key]);
                    $numberOfDeletedReferences++;
                }
            }
            $labeledThing->setGroupIds($newGroup);
            if (!$dryRun) {
                $labeledThingFacade->save($labeledThing);
            }
        }

        return $numberOfDeletedReferences;
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrames
     * @param                             $projectId
     * @param                             $taskId
     *
     * @return array
     */
    private function getInvalidLabeledThingReferencesFromLabeledThingInFrames(
        $labeledThingsInFrames,
        $projectId,
        $taskId
    ) {
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $taskId
        );

        $invalidLabeledThingInFrames = [];
        foreach ($labeledThingsInFrames as $labeledThingsInFrame) {
            $labeledThing = $labeledThingFacade->find($labeledThingsInFrame->getLabeledThingId());
            if ($labeledThing === null) {
                $invalidLabeledThingInFrames[] = $labeledThingsInFrame;
            } else {
                $this->documentManager->detach($labeledThing);
            }
        }

        return $invalidLabeledThingInFrames;
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingInFrames
     * @param                             $dryRun
     * @param                             $logFilePath
     */
    private function deleteLabeledThingInFrames($labeledThingInFrames, $frameNumberMapping, $dryRun, $logFilePath)
    {
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $labeledThingInFrame->getProjectId(),
                $labeledThingInFrame->getTaskId()
            );
            if (!$dryRun) {
                $labeledThingInFrameFacade->delete([$labeledThingInFrame]);
            }
            file_put_contents(
                $logFilePath,
                sprintf(
                    "%s;%s;%s;%s%s",
                    'Invalid_ltif_reference',
                    $labeledThingInFrame->getProjectId(),
                    $labeledThingInFrame->getTaskId(),
                    $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    "\n"
                ),
                FILE_APPEND
            );
        }
    }

    /**
     * @param $objects
     */
    private function detachObjects($objects)
    {
        foreach($objects as $object) {
            $this->documentManager->detach($object);
        }
        $this->documentManager->clear();
    }
}