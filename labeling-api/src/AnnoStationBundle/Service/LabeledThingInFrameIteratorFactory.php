<?php
namespace AnnoStationBundle\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Helper\Iterator;

class LabeledThingInFrameIteratorFactory
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrameFacade)
    {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
    }

    /**
     * @param Model\LabelingTask $task
     * @return Iterator\LabeledThingInFrame
     */
    public function create(Model\LabelingTask $task)
    {
        return new Iterator\LabeledThingInFrame($this->labeledThingInFrameFacade, $task);
    }
}
