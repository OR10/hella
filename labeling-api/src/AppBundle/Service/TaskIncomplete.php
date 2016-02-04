<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Database\Facade;

class TaskIncomplete
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * TaskIncomplete constructor.
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Facade\LabeledThing $labeledThingFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade
    )
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade = $labeledThingFacade;
    }

    public function isLabeledThingIncomplete(Model\LabeledThing $labeledThing)
    {
        $labeledThingInFrames = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        if (empty($labeledThingInFrames)) {
            return true;
        }
        foreach($labeledThingInFrames as $labeledThingInFrame) {
            if ($this->isLabeledThingInFrameIncomplete($labeledThingInFrame)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @return bool
     */
    public function isLabeledThingInFrameIncomplete(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $classes = $labeledThingInFrame->getClasses();
        $labeledThing = $this->labeledThingFacade->find($labeledThingInFrame->getLabeledThingId());
        $task = $this->labelingTaskFacade->find($labeledThing->getTaskId());
        $rootStructure = $this->labelingTaskFacade->getLabelStructure($task);

        foreach ($rootStructure['children'] as $child) {
            if (!$this->searchStructureForClasses($classes, $child)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param $classes
     * @param $structure
     * @param int $level
     * @return bool
     */
    private function searchStructureForClasses($classes, $structure, $level = 0)
    {
        if ($level === 0 || in_array($structure['name'], $classes)) {
            if (isset($structure['children'])) {
                foreach ($structure['children'] as $child) {
                    if ($this->searchStructureForClasses($classes, $child, $level + 1)) {
                        return true;
                    }
                }
                return false;
            } else {
                return true;
            }
        }

        return false;
    }
}