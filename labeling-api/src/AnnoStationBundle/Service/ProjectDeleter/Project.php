<?php

namespace AnnoStationBundle\Service\ProjectDeleter;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service\ProjectDeleter\Delete;

class Project
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Delete\Exports
     */
    private $exportsDeleter;

    /**
     * @var Delete\Reports
     */
    private $reportsDeleter;

    /**
     * @var Delete\LabelingTasks
     */
    private $labelingTasksDeleter;

    /**
     * Project constructor.
     *
     * @param Facade\Project       $projectFacade
     * @param Delete\Exports       $exportsDeleter
     * @param Delete\Reports       $reportsDeleter
     * @param Delete\LabelingTasks $labelingTasksDeleter
     */
    public function __construct(
        Facade\Project $projectFacade,
        Delete\Exports $exportsDeleter,
        Delete\Reports $reportsDeleter,
        Delete\LabelingTasks $labelingTasksDeleter
    ) {
        $this->projectFacade        = $projectFacade;
        $this->exportsDeleter       = $exportsDeleter;
        $this->reportsDeleter       = $reportsDeleter;
        $this->labelingTasksDeleter = $labelingTasksDeleter;
    }

    public function delete(Model\Project $project)
    {
        $project->setDeletedState(Model\Project::DELETED_IN_PROGRESS);
        $this->projectFacade->save($project);

        $this->exportsDeleter->delete($project);
        $this->reportsDeleter->delete($project);
        $this->labelingTasksDeleter->delete($project);
        $this->projectFacade->delete($project);
    }
}
