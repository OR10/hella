<?php

namespace AppBundle\Response;

use AppBundle\Model;
use AppBundle\Database\Facade;

class Task
{
    /**
     * @var Model\LabelingTask[]
     */
    private $result = [
        'tasks' => [],
        'users' => [],
    ];

    /**
     * @var int
     */
    private $totalRows;

    /**
     * @param Model\LabelingTask[] $labelingTasks
     * @param Facade\Video         $videoFacade
     * @param Facade\User          $userFacade
     * @param Facade\Project       $projectFacade
     * @param                      $numberOfTotalDocuments
     * @param                      $phase
     */
    public function __construct(
        $labelingTasks,
        Facade\Video $videoFacade,
        Facade\User $userFacade,
        Facade\Project $projectFacade,
        $numberOfTotalDocuments,
        $phase
    ) {
        $this->totalRows = $numberOfTotalDocuments;
        $users = [];
        foreach ($labelingTasks as $labelingTask) {
            $user = $labelingTask->getUserId() === null ? null : $userFacade->getUserById($labelingTask->getUserId());

            $users = array_merge(
                $userFacade->getUserByIds(
                    array_map(
                        function ($assignedUser) {
                            return $assignedUser[0];
                        },
                        $labelingTask->getAssignmentHistory() === null ? [] : $labelingTask->getAssignmentHistory())
                )
                , $users
            );

            $this->result['tasks'][] = [
                'id' => $labelingTask->getId(),
                'rev' => $labelingTask->getRev(),
                'descriptionTitle' => $labelingTask->getDescriptionTitle(),
                'descriptionText' => $labelingTask->getDescriptionText(),
                'requiredImageTypes' => $labelingTask->getRequiredImageTypes(),
                'status' => $labelingTask->getRawStatus(),
                'taskType' => $labelingTask->getTaskType(),
                'predefinedClasses' => $labelingTask->getPredefinedClasses(),
                'drawingTool' => $labelingTask->getDrawingTool(),
                'drawingToolOptions' => $labelingTask->getDrawingToolOptions(),
                'labelStructure' => $labelingTask->getLabelStructure(),
                'labelStructureUi' => $labelingTask->getLabelStructureUi(),
                'labelInstruction' => $labelingTask->getLabelInstruction(),
                'minimalVisibleShapeOverflow' => $labelingTask->getMinimalVisibleShapeOverflow(),
                'frameNumberMapping' => $labelingTask->getFrameNumberMapping(),
                'metaData' => $labelingTask->getMetaData(),
                'reopen' => $labelingTask->isReopen(),
                'createdAt' => $labelingTask->getCreatedAt(),
                'userId' => $labelingTask->getUserId(),
                'user' => $user instanceof Model\User ? $user->getUsername() : null,
                'video' => $videoFacade->find($labelingTask->getVideoId()),
                'project' => $projectFacade->find($labelingTask->getProjectId()),
                'assignmentHistory' => $labelingTask->getAssignmentHistory(),
                'assignedUserId' => $labelingTask->getAssignedUserId(),
            ];
        }
        /** @var Model\User $user */
        foreach ($users as $user) {
            if (!isset($this->result['users'][$user->getId()]))
            $this->result['users'][$user->getId()] = $user;
        }
    }
}