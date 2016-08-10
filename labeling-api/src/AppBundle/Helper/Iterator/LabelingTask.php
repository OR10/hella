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
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * LabelingTask constructor.
     *
     * @param Facade\Project $projectFacade
     * @param Model\Project                      $project
     */
    public function __construct(Facade\Project $projectFacade, Model\Project $project)
    {
        $this->projectFacade = $projectFacade;
        $this->project       = $project;
    }

    public function getIterator()
    {
        return $this->labelingTaskIteratorGenerator();
    }

    private function labelingTaskIteratorGenerator()
    {
        if (empty($this->labelingTasks)) {
            $this->labelingTasks = $this->projectFacade->getTasksByProject($this->project);
        }

        foreach ($this->labelingTasks as $labelingTask) {
            yield $labelingTask;
        }
    }
}
