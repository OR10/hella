<?php
namespace AppBundle\Helper\Iterator;

use Traversable;
use AppBundle\Database\Facade;
use AppBundle\Model;

class LabeledFrame implements \IteratorAggregate
{
    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * @var Facade\LabeledFrame
     */
    private $labelingTaskFacade;

    /**
     * @var array
     */
    private $labeledFrames = [];

    /**
     * @param Model\LabelingTask  $labelingTask
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Model\LabelingTask $labelingTask, Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTask       = $labelingTask;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    public function getIterator()
    {
        return $this->labeledFrameIteratorGenerator();
    }

    private function labeledFrameIteratorGenerator()
    {
        $this->labeledFrames = $this->labelingTaskFacade->getLabeledFrames($this->labelingTask);

        foreach ($this->labeledFrames as $labeledFrame) {
            yield $labeledFrame;
        }
    }
}
