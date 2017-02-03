<?php
namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class Project
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * Project constructor.
     *
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        $this->projectFacade = $projectFacade;
    }

    /**
     * @param Model\Project $project
     *
     * @return Model\Project
     */
    public function save(Model\Project $project)
    {
        return $this->projectFacade->save($project);
    }

    /**
     * @param string $id
     *
     * @return Model\Project
     */
    public function find($id)
    {
        return $this->projectFacade->find($id);
    }
}