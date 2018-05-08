<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabeledThingCreateByUser implements \IteratorAggregate
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
     * @var Model\LabeledThing
     */
    private $labeledThings = [];

    /**
     * @var string
     */
    private $userId;

    /**
     * LabeledThing constructor.
     *
     * @param Model\LabelingTask  $labelingTask
     * @param Facade\LabeledThing $labeledThingFacade
     */
    public function __construct(Model\LabelingTask $labelingTask, string $userId, Facade\LabeledThing $labeledThingFacade)
    {
        $this->labelingTask       = $labelingTask;
        $this->labeledThingFacade = $labeledThingFacade;
        $this->userId             = $userId;
    }

    public function getIterator()
    {
        return $this->labeledThingIteratorGenerator();
    }

    private function labeledThingIteratorGenerator()
    {
        $this->labeledThings = $this->labeledThingFacade->findByTaskUserId($this->labelingTask, $this->userId);

        foreach ($this->labeledThings as $labeledThings) {
            yield $labeledThings;
        }
    }
}
