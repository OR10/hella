<?php

namespace AnnoStationBundle\Service\v1;

use AnnoStationBundle\Database\Facade\Project;
use AppBundle\Model\LabelingTask;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use AnnoStationBundle\Database\Facade\LabelingTask as LabelingTaskFacade;

class TaskService
{
    /**
     * @var Project
     */
    private $projectFacade;

    /**
     * @var LabelingTaskFacade
     */
    private $labelingTaskFacade;

    /**
     * TaskService constructor.
     *
     * @param Project             $projectFacade
     * @param LabelingTaskFacade  $labelingTaskFacade
     */
    public function __construct(
        Project $projectFacade,
        LabelingTaskFacade $labelingTaskFacade
    )
    {
        $this->projectFacade       = $projectFacade;
        $this->labelingTaskFacade  = $labelingTaskFacade;
    }

    /**return project tasks
     * @param $request
     * @return array
     */
    public function getTask($request)
    {
        $offset     = $request->query->has('offset') ? $request->query->getInt('offset') : null;
        $limit      = $request->query->has('limit') ? $request->query->getInt('limit') : null;
        $taskPhase  = $request->query->get('phase');
        $taskStatus = $request->query->get('taskStatus');
        $projectId  = $request->query->get('project');
        if ($projectId === null) {
            throw new BadRequestHttpException('Please provide a project ID');
        }

        $result = [];
        $project = $this->projectFacade->find($projectId);
        if ($project === null) {
            throw new BadRequestHttpException(sprintf('There is no project with the id "%s"', $projectId));
        }

        if (($offset !== null && $offset < 0) || ($limit !== null && $limit < 0)) {
            throw new BadRequestHttpException('Invalid offset or limit');
        }

        if (isset($taskPhase)) {
            $numberOfTotalDocumentsByStatus = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);
            $numberOfTotalDocumentsByStatus = $numberOfTotalDocumentsByStatus[$taskPhase];
        }

        $tasks                  = [];
        $numberOfTotalDocuments = 0;

        switch ($taskStatus) {
            case LabelingTask::STATUS_IN_PROGRESS:
                $tasks                  = $this->labelingTaskFacade->findAllByStatusAndProject(
                    LabelingTask::STATUS_IN_PROGRESS,
                    $project,
                    $offset,
                    $limit,
                    $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[LabelingTask::STATUS_IN_PROGRESS];
                break;
            case LabelingTask::STATUS_TODO:
                $tasks                  = $this->labelingTaskFacade->findAllByStatusAndProject(
                    LabelingTask::STATUS_TODO,
                    $project,
                    $offset,
                    $limit,
                    $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[LabelingTask::STATUS_TODO];
                break;
            case LabelingTask::STATUS_DONE:
                $tasks                  = $this->labelingTaskFacade->findAllByStatusAndProject(
                    LabelingTask::STATUS_DONE,
                    $project,
                    $offset,
                    $limit,
                    $taskPhase
                )->toArray();
                $numberOfTotalDocuments = $numberOfTotalDocumentsByStatus[LabelingTask::STATUS_DONE];
                break;
            case LabelingTask::STATUS_ALL_PHASES_DONE:
                $tasks = $this->labelingTaskFacade->getAllDoneLabelingTasksForProject(
                    $project,
                    $offset,
                    $limit
                )->toArray();

                $numberOfTotalDocuments = $this->labelingTaskFacade->getSumOfAllDoneLabelingTasksForProject(
                    $project
                );
                break;
        }

        usort(
            $tasks,
            function ($a, $b) {
                if ($a->getCreatedAt() === null || $b->getCreatedAt() === null) {
                    return -1;
                }
                if ($a->getCreatedAt()->getTimestamp() === $b->getCreatedAt()->getTimestamp()) {
                    return 0;
                }

                return ($a->getCreatedAt()->getTimestamp() > $b->getCreatedAt()->getTimestamp()) ? -1 : 1;
            }
        );

        $result['tasks'] = $tasks;
        $result['numberOfTotalDocuments'] = $numberOfTotalDocuments;

        return $result;
    }
}
