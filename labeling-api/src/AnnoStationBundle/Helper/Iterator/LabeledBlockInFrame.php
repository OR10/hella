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
    private $labelingBlockInFrame = [];

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Facade\LabeledBlockInFrame
     */
    private $labelBlockInFrameFacade;

    /**
     * LabeledBlockInFrame constructor.
     * @param Model\LabelingTask $task
     * @param Facade\LabeledBlockInFrame $labeledBlockInFrame
     */
    public function __construct(Model\LabelingTask $task, Facade\LabeledBlockInFrame $labeledBlockInFrame)
    {
        $this->task     = $task;
        $this->labelBlockInFrameFacade = $labeledBlockInFrame;
    }

    /**
     * @return \Generator
     */
    public function getIterator()
    {
        return $this->labelingTaskIteratorGenerator();
    }

    /**
     * @return \Generator
     */
    private function labelingTaskIteratorGenerator()
    {
        $this->labelingBlockInFrame = $this->labelBlockInFrameFacade->findByTaskId($this->task);

        foreach ($this->labelingBlockInFrame as $labelingFrameBlock) {
            yield $labelingFrameBlock;
        }
    }
}
