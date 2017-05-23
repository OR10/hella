<?php

namespace AnnoStationBundle\Response;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;

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
     * @param AppFacade\User       $userFacade
     * @param Facade\Project       $projectFacade
     * @param                      $numberOfTotalDocuments
     */
    public function __construct(
        $labelingTasks,
        Facade\Video $videoFacade,
        AppFacade\User $userFacade,
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

            $video = $videoFacade->find($labelingTask->getVideoId());
            $imageTypes = array_map(function($type) {
                unset($type['sizeInBytes']);

                return $type;
            }, $video->getImageTypes());
            $video = [
                'id'             => $video->getId(),
                'rev'            => $video->getRev(),
                'name'           => $video->getName(),
                'metaData'       => $video->getMetaData(),
                'imageTypes'     => $imageTypes,
                'calibrationId'  => $video->getCalibrationId(),
            ];

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
                'video'                       => $video,
                'project'                     => $projectFacade->find($labelingTask->getProjectId()),
                'assignmentHistory'           => $labelingTask->getAssignmentHistory(),
                'taskAttentionFlag'           => $labelingTask->isTaskAttentionFlag(),
                'labelDataImportInProgress'   => $labelingTask->isLabelDataImportInProgress(),
            ];
        }

        $users                 = new SimpleUsers($users);
        $this->result['users'] = $users->getResult();
    }
}
