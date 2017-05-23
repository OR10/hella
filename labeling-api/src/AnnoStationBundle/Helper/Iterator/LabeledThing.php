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
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var array
     */
    private $labeledThings = [];

    /**
     * LabeledThing constructor.
     *
     * @param Model\LabelingTask  $labelingTask
     * @param Facade\LabeledThing $labeledThingFacade
     */
    public function __construct(Model\LabelingTask $labelingTask, Facade\LabeledThing $labeledThingFacade)
    {
        $this->labelingTask       = $labelingTask;
        $this->labeledThingFacade = $labeledThingFacade;
    }

    public function getIterator()
    {
        return $this->labeledThingIteratorGenerator();
    }

    private function labeledThingIteratorGenerator()
    {
        $this->labeledThings = $this->labeledThingFacade->findByTaskId($this->labelingTask);

        foreach ($this->labeledThings as $labeledThings) {
            yield $labeledThings;
        }
    }
}
