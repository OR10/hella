<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Service;

class LabeledThingInFrame implements \IteratorAggregate
{
    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var array
     */
    private $labeledThingsInFrames = [];

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagation;

    /**
     * LabelingTask constructor.
     *
     * @param Facade\LabeledThingInFrame      $labeledThingInFrameFacade
     * @param Model\LabelingTask              $task
     * @param Service\GhostClassesPropagation $ghostClassesPropagation|null
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Model\LabelingTask $task,
        Service\GhostClassesPropagation $ghostClassesPropagation = null
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->task                      = $task;
        $this->ghostClassesPropagation   = $ghostClassesPropagation;
    }

    public function getIterator()
    {
        return $this->labelingThingsInFramesIteratorGenerator();
    }

    private function labelingThingsInFramesIteratorGenerator()
    {
        if (empty($this->labeledThingsInFrames)) {
            $this->labeledThingsInFrames = $this->labeledThingInFrameFacade->getLabeledThingsInFrame(
                $this->task
            );
        }

        if(isset($this->ghostClassesPropagation)) {
            $this->labeledThingsInFrames = $this->ghostClassesPropagation->propagateGhostClasses(
                $this->labeledThingsInFrames
            );
        }

        foreach ($this->labeledThingsInFrames as $labeledThingInFrame) {
            yield $labeledThingInFrame;
        }
    }
}
