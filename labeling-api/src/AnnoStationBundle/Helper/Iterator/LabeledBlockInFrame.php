<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabeledBlockInFrame implements \IteratorAggregate
{
    /**
     * @var array
     */
    private $labelingFrameWithBlock = [];

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Facade\LabelingTask
     */
    private $labelBlockInFrameFacade;

    /**
     * LabeledBlockInFrame constructor.
     * @param Facade\LabeledBlockInFrame $labeledBlockInFrame
     * @param Model\LabelingTask $task
     */
    public function __construct(Facade\LabeledBlockInFrame $labeledBlockInFrame, Model\LabelingTask $task)
    {
        $this->task     = $task;
        $this->labelBlockInFrameFacade = $labeledBlockInFrame;
    }

    public function getIterator()
    {
        return $this->labelingTaskIteratorGenerator();
    }

    private function labelingTaskIteratorGenerator()
    {
        $this->labelingFrameWithBlock = $this->labelBlockInFrameFacade->findByTaskId($this->task);

        foreach ($this->labelingFrameWithBlock as $labelingFrameBlock) {
            yield $labelingFrameBlock;
        }
    }
}
