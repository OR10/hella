<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabeledBlock implements \IteratorAggregate
{
    /**
     * @var array
     */
    private $labelingFrameWithBlock = [];

    /**
     * @var Model\Video
     */
    private $blockInFrame;

    /**
     * @var Facade\LabelingTask
     */
    private $labelBlockFacade;

    /**
     * LabelingBlock constructor.
     * @param Facade\LabeledBlock $labeledBlock
     * @param Model\LabeledBlockInFrame $blockInFrame
     */
    public function __construct(Facade\LabeledBlock $labeledBlock, Model\LabeledBlockInFrame $blockInFrame)
    {
        $this->blockInFrame     = $blockInFrame;
        $this->labelBlockFacade = $labeledBlock;
    }

    public function getIterator()
    {
        return $this->labelingTaskIteratorGenerator();
    }

    private function labelingTaskIteratorGenerator()
    {
        $this->labelingFrameWithBlock = $this->labelBlockFacade->findLabeledBlockInFrame($this->blockInFrame->getLabeledGroupIds());

        foreach ($this->labelingFrameWithBlock as $labelingFrameBlock) {
            yield $labelingFrameBlock;
        }
    }
}
