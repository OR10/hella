<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class TaskTimeByTask implements \IteratorAggregate
{
    /**
     * @var Model\TaskTimer
     */
    private $task;

    /**
     * @var Model\TaskTimer
     */
    private $totalTaskTime = [];

    /**
     * @var Facade\TaskTimer
     */
    private $taskTimeFacade;

    /**
     * TaskTimeByTask constructor.
     * @param Model\LabelingTask $labelingTask
     * @param Facade\TaskTimer $taskTimeFacade
     */
    public function __construct(Model\LabelingTask $labelingTask, Facade\TaskTimer $taskTimeFacade)
    {
        $this->task           = $labelingTask;
        $this->taskTimeFacade = $taskTimeFacade;
    }

    /**
     * @return \Generator
     */
    public function getIterator()
    {
        return $this->labeledThingIteratorGenerator();
    }

    /**
     * @return \Generator
     */
    private function labeledThingIteratorGenerator()
    {
        $this->totalTaskTime = $this->taskTimeFacade->findByTask($this->task);

        foreach ($this->totalTaskTime as $taskTime) {
            yield $taskTime;
        }
    }
}
