<?php
namespace AppBundle\Helper\Iterator;

use Traversable;
use AppBundle\Database\Facade;
use AppBundle\Model;

class LabelingTask implements \IteratorAggregate
{
    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var array
     */
    private $labelingTasks = [];

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * LabelingTask constructor.
     * @param Facade\LabelingTask $labelingTaskFacade
     * @param Model\Project       $project
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade, Model\Project $project)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->project            = $project;
    }

    public function getIterator()
    {
        return $this->labelingTaskIteratorGenerator();
    }

    private function labelingTaskIteratorGenerator()
    {
        if (empty($this->labelingTasks)) {
            $this->labelingTasks = $this->labelingTaskFacade->findAllByProjects(
                [$this->project->getId()]
            );
        }

        foreach ($this->labelingTasks as $labelingTask) {
            yield $labelingTask;
        }
    }
}
