<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Service;

class NextClassThingInFrame implements \IteratorAggregate
{
    /**
     * @var array
     */
    private $labeledThingsInFrames = [];

    /**
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagation;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Facade\LabeledBlockInFrame
     */
    private $labeledThingFacade;

    /**
     * @var array
     */
    private $currentThingParam;

    /**
     * NextClassThingInFrame constructor.
     *
     * @param Facade\LabeledThingInFrame      $labeledThingInFrameFacade
     * @param Model\LabelingTask              $task
     * @param Service\GhostClassesPropagation $ghostClassesPropagation
     * @param array                           $currentThingParam
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Model\LabelingTask $task,
        Service\GhostClassesPropagation $ghostClassesPropagation,
        array $currentThingParam
    ) {
        $this->ghostClassesPropagation = $ghostClassesPropagation;
        $this->task                    = $task;
        $this->labeledThingFacade      = $labeledThingInFrameFacade;
        $this->currentThingParam       = $currentThingParam;
    }

    /**
     * @return \Generator
     */
    public function getIterator()
    {
        return $this->labelingThingsInFramesIteratorGenerator();
    }

    /**
     * @return \Generator
     */
    private function labelingThingsInFramesIteratorGenerator()
    {
        if (empty($this->labeledThingsInFrames)) {
            $this->labeledThingsInFrames = $this->labeledThingFacade->getNextThingByTaskClass($this->task, $this->currentThingParam);
        }

        $this->labeledThingsInFrames = $this->ghostClassesPropagation->propagateGhostClasses(
            $this->labeledThingsInFrames
        );

        foreach ($this->labeledThingsInFrames as $labeledThingInFrame) {
            yield $labeledThingInFrame;
        }
    }
}
