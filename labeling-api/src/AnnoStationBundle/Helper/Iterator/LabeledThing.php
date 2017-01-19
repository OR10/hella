<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabeledThing implements \IteratorAggregate
{
    /**
     * @var Model\LabelingTask
     */
    private $labelingTask;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var array
     */
    private $labeledThings = [];

    /**
     * @param Model\LabelingTask  $labelingTask
     * @param Facade\LabelingTask $labelingTaskFacade
     *
     * @internal param Facade\LabeledThing $labeledThingFacade
     */
    public function __construct(Model\LabelingTask $labelingTask, Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTask       = $labelingTask;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    public function getIterator()
    {
        return $this->labeledThingIteratorGenerator();
    }

    private function labeledThingIteratorGenerator()
    {
        $this->labeledThings = $this->labelingTaskFacade->getLabeledThings($this->labelingTask);

        foreach ($this->labeledThings as $labeledThings) {
            yield $labeledThings;
        }
    }
}
