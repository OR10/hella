<?php
namespace AppBundle\Helper\Iterator;

use Traversable;
use AppBundle\Database\Facade;
use AppBundle\Model;

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
     * LabelingTask constructor.
     *
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Model\LabelingTask         $task
     */
    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrameFacade, Model\LabelingTask $task)
    {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->task                      = $task;
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

        foreach ($this->labeledThingsInFrames as $labeledThingInFrame) {
            yield $labeledThingInFrame;
        }
    }
}
