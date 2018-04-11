<?php
namespace AnnoStationBundle\Helper\Iterator;

use Traversable;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class TotalTaskTime implements \IteratorAggregate
{
    /**
     * @var Model\TaskTimer
     */
    private $task;

    private $userId;

    /**
     * @var Facade\TaskTimer
     */
    private $taskTimeFacade;

    /**
     * @var array
     */
    private $totalTaskTime = [];

    /**
     * TotalTaskTime constructor.
     * @param Model\TaskTimer $taskTime
     * @param Facade\TaskTimer $taskTimeFacade
     */
    public function __construct(Model\LabelingTask $labelingTask, $userId, Facade\TaskTimer $taskTimeFacade)
    {
        $this->task           = $labelingTask;
        $this->taskTimeFacade = $taskTimeFacade;
        $this->userId         = $userId;
    }

    public function getIterator()
    {
        return $this->labeledThingIteratorGenerator();
    }

    private function labeledThingIteratorGenerator()
    {

        $this->totalTaskTime = $this->taskTimeFacade->findByTaskId($this->task, $this->userId);

        foreach ($this->totalTaskTime as $taskTime) {
            yield $taskTime;
        }
    }
}
