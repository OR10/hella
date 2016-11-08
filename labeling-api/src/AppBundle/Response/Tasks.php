<?php

namespace AppBundle\Response;

use AppBundle\Model;
use AppBundle\Database\Facade;

class Tasks
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
     */
    public function __construct(
        $labelingTasks,
        Facade\Video $videoFacade,
        Facade\User $userFacade,
        Facade\Project $projectFacade,
        $numberOfTotalDocuments
    ) {
        $this->totalRows = $numberOfTotalDocuments;
        $users           = [];
        foreach ($labelingTasks as $labelingTask) {
            $user = $labelingTask->getUserId() === null ? null : $userFacade->getUserById($labelingTask->getUserId());

            $users = array_merge(
                $userFacade->getUserByIds(
                    array_map(
                        function ($historyEntry) {
                            return $historyEntry['userId'];
                        },
                        $labelingTask->getAssignmentHistory() === null ? [] : $labelingTask->getAssignmentHistory()
                    ),
                    false
                ),
                $users
            );

            $this->result['tasks'][] = [
                'id'                          => $labelingTask->getId(),
                'rev'                         => $labelingTask->getRev(),
                'descriptionTitle'            => $labelingTask->getDescriptionTitle(),
                'descriptionText'             => $labelingTask->getDescriptionText(),
                'requiredImageTypes'          => $labelingTask->getRequiredImageTypes(),
                'status'                      => $labelingTask->getRawStatus(),
                'taskType'                    => $labelingTask->getTaskType(),
                'predefinedClasses'           => $labelingTask->getPredefinedClasses(),
                'drawingTool'                 => $labelingTask->getDrawingTool(),
                'drawingToolOptions'          => $labelingTask->getDrawingToolOptions(),
                'labelStructure'              => $labelingTask->getLabelStructure(),
                'labelStructureUi'            => $labelingTask->getLabelStructureUi(),
                'labelInstruction'            => $labelingTask->getLabelInstruction(),
                'minimalVisibleShapeOverflow' => $labelingTask->getMinimalVisibleShapeOverflow(),
                'frameNumberMapping'          => $labelingTask->getFrameNumberMapping(),
                'metaData'                    => $labelingTask->getMetaData(),
                'reopen'                      => $labelingTask->getReopenByPhase(),
                'createdAt'                   => $labelingTask->getCreatedAt(),
                'userId'                      => $labelingTask->getUserId(),
                'user'                        => $user instanceof Model\User ? $user->getUsername() : null,
                'video'                       => $videoFacade->find($labelingTask->getVideoId()),
                'project'                     => $projectFacade->find($labelingTask->getProjectId()),
                'assignmentHistory'           => $labelingTask->getAssignmentHistory(),
                'taskAttentionFlag'           => $labelingTask->isTaskAttentionFlag(),
            ];
        }

        $users                 = new SimpleUsers($users);
        $this->result['users'] = $users->getResult();
    }
}
