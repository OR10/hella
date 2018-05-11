<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Service;

class PhaseThingInFrameByUser implements \IteratorAggregate
{
    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\LabeledThingInFrame
     */
    private $labeledThingsInFrames = [];

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;


    /**
     * PhaseThingInFrameCreateByUser constructor.
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Model\LabelingTask $task
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Model\LabelingTask $task
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->task                      = $task;
    }

    public function getIterator()
    {
        return $this->labelingThingsInFramesIteratorGenerator();
    }

    private function labelingThingsInFramesIteratorGenerator()
    {
        $this->labeledThingsInFrames = $this->labeledThingInFrameFacade->getLabeledThingsInFrameByTask($this->task);
        foreach ($this->labeledThingsInFrames as $labeledThingInFrame) {
            yield $labeledThingInFrame;
        }
    }
}
