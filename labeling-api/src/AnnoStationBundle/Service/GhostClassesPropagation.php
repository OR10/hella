<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AppBundle\Model;
use AnnoStationBundle\Helper;


/**
 * Propagate GhostClasses for any number of labeledThingsInFrame
 *
 * @package AppBundle\Service
 */
class GhostClassesPropagation
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFactory;

    /**
     * GhostClassesPropagationService constructor.
     *
     * @param Facade\LabelingTask                 $labelingTaskFacade
     * @param Facade\TaskConfiguration            $taskConfigurationFacade
     * @param LabeledThingInFrame\FacadeInterface $labeledThingInFrameFactory
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        LabeledThingInFrame\FacadeInterface $labeledThingInFrameFactory
    ) {
        $this->labelingTaskFacade         = $labelingTaskFacade;
        $this->taskConfigurationFacade    = $taskConfigurationFacade;
        $this->labeledThingInFrameFactory = $labeledThingInFrameFactory;
    }

    /**
     * Propagate `ghostClasses` through a given list of `LabeledThingsInFrame`.
     *
     * The list must have no frame gaps, aka. needs to be complete from start to end.
     *
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrames
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function propagateGhostClasses(array $labeledThingsInFrames)
    {
        $workingCopy = $this->cloneLabeledThingsInFrame($labeledThingsInFrames);
        $this->sortLabeledThingsInFrameByFrame($workingCopy);

        $propagatedClassesCache = array();

        foreach ($workingCopy as $labeledThingInFrame) {
            $labeledThingInFrameFacade = $this->labeledThingInFrameFactory->getFacadeByProjectIdAndTaskId(
                $labeledThingInFrame->getProjectId(),
                $labeledThingInFrame->getTaskId()
            );
            $task           = $this->labelingTaskFacade->find($labeledThingInFrame->getTaskId());
            $labeledThingId = $labeledThingInFrame->getLabeledThingId();

            if (!empty($labeledThingInFrame->getClasses())) {
                // No ghost class look behind needed. LabeledThingInFrame is complete
                // Remember the classes for LabeledThingsInFrame to come.
                $propagatedClassesCache[$labeledThingId] = $labeledThingInFrame->getClasses();
                continue;
            }

            // No classes set. Need to check for ghostClasses
            if (!array_key_exists($labeledThingId, $propagatedClassesCache)) {
                $previousLabeledThingInFrameWithClasses = $labeledThingInFrameFacade
                    ->getPreviousLabeledThingInFrameWithClasses($labeledThingInFrame);

                // There might be no such previous LabeledThingInFrame
                if ($previousLabeledThingInFrameWithClasses instanceof Model\LabeledThingInFrame) {
                    $propagatedClassesCache[$labeledThingId] = $previousLabeledThingInFrameWithClasses->getClasses();
                }

                $nextLabeledThingInFrame = $this->getNextGhostClasses($task, $labeledThingInFrame);
                if ($previousLabeledThingInFrameWithClasses === null && $nextLabeledThingInFrame instanceof  Model\LabeledThingInFrame) {
                    $propagatedClassesCache[$labeledThingId] = $nextLabeledThingInFrame->getClasses();
                }

                if ($previousLabeledThingInFrameWithClasses === null && $nextLabeledThingInFrame === null) {
                    $propagatedClassesCache[$labeledThingId] = null;
                    continue;
                }
            }

            // Update the ghost classes for this LabeledThingInFrame with data from the cache, which is correctly filled
            // at this point.
            $labeledThingInFrame->setGhostClasses($propagatedClassesCache[$labeledThingId]);
        }

        return $workingCopy;
    }

    private function getNextGhostClasses(Model\LabelingTask $task, Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $labeledThingInFrameFacade = $this->labeledThingInFrameFactory->getFacadeByProjectIdAndTaskId(
            $labeledThingInFrame->getProjectId(),
            $labeledThingInFrame->getTaskId()
        );

        if ($task->getTaskConfigurationId() === null) {
            return null;
        }
        $identifier        = $labeledThingInFrame->getIdentifierName();
        $taskConfiguration = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());
        $helper            = new Helper\IncompleteClassesChecker\RequirementsXml($taskConfiguration->getRawData());

        if ($helper->getThingPrediction($identifier) === 'all') {
            $labeledThingInFrame = $labeledThingInFrameFacade->getNextLabeledThingInFrameWithClasses(
                $labeledThingInFrame,
                $task
            );

            return $labeledThingInFrame;
        }
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrame
     *
     * @return Model\LabeledThingInFrame[]
     */
    private function cloneLabeledThingsInFrame(array $labeledThingsInFrame)
    {
        $clones = array();
        foreach ($labeledThingsInFrame as $labeledThingInFrame) {
            $clones[] = $labeledThingInFrame->copy(null, true);
        }

        return $clones;
    }

    /**
     * Sort the given `LabeledThingsInFrame` by their FrameIndex.
     *
     * Sorting is done in place.
     *
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrame
     */
    private function sortLabeledThingsInFrameByFrame(array &$labeledThingsInFrame)
    {
        usort(
            $labeledThingsInFrame,
            function (Model\LabeledThingInFrame $a, Model\LabeledThingInFrame $b) {
                return $a->getFrameIndex() <=> $b->getFrameIndex();
            }
        );
    }
}
