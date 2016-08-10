<?php
namespace AppBundle\Helper\Iterator;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Helper\Iterator;

class LabelingTaskIteratorFactory
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @param Model\Project $project
     * @return LabelingTask
     */
    public function create(Model\Project $project)
    {
        return new Iterator\LabelingTask($this->labelingTaskFacade, $project);
    }
}