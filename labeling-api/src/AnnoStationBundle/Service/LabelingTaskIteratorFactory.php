<?php
namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Helper\Iterator;

class LabelingTaskIteratorFactory
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        $this->projectFacade = $projectFacade;
    }

    /**
     * @param Model\Project $project
     *
     * @return Iterator\LabelingTask
     */
    public function create(Model\Project $project)
    {
        return new Iterator\LabelingTask($this->projectFacade, $project);
    }
}
