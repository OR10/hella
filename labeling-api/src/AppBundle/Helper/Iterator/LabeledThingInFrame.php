<?php
namespace AppBundle\Helper\Iterator;

use Traversable;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;

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
     * @param Service\GhostClassesPropagation $ghostClassesPropagation
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Model\LabelingTask $task,
        Service\GhostClassesPropagation $ghostClassesPropagation
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

        $this->labeledThingsInFrames = $this->ghostClassesPropagation->propagateGhostClasses(
            $this->labeledThingsInFrames
        );

        foreach ($this->labeledThingsInFrames as $labeledThingInFrame) {
            yield $labeledThingInFrame;
        }
    }
}
