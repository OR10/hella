<?php

namespace AppBundle\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;

/**
 * Propagate GhostClasses for any number of labeledThingsInFrame
 *
 * @package AppBundle\Service
 */
class GhostClassesPropagation
{

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * GhostClassesPropagationService constructor.
     *
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
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
            $labeledThingId = $labeledThingInFrame->getLabeledThingId();

            if (!empty($labeledThingInFrame->getClasses())) {
                // No ghost class look behind needed. LabeledThingInFrame is complete
                // Remember the classes for LabeledThingsInFrame to come.
                $propagatedClassesCache[$labeledThingId] = $labeledThingInFrame->getClasses();
                continue;
            }

            // No classes set. Need to check for ghostClasses
            if (!array_key_exists($labeledThingId, $propagatedClassesCache)) {
                $previousLabeledThingInFrameWithClasses = $this->labeledThingInFrameFacade
                    ->getPreviousLabeledThingInFrameWithClasses($labeledThingInFrame);

                // There might be no such previous LabeledThingInFrame
                if (!($previousLabeledThingInFrameWithClasses instanceof Model\LabeledThingInFrame)) {
                    // Remember that there isn't a previous LabeledThingInFrame with classes for the next cycle
                    // Ghost classes are not set, as there are none
                    $propagatedClassesCache[$labeledThingId] = null;
                    continue;
                }

                // We found a previous LabeledThingInFrame with classes. The cache needs to be filled
                $propagatedClassesCache[$labeledThingId] = $previousLabeledThingInFrameWithClasses->getClasses();
            }

            // Update the ghost classes for this LabeledThingInFrame with data from the cache, which is correctly filled
            // at this point.
            $labeledThingInFrame->setGhostClasses($propagatedClassesCache[$labeledThingId]);
        }

        return $workingCopy;
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
