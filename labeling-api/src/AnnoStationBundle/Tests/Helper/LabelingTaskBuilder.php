<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model;

/**
 * Helper class to create LabelingTasks.
 */
class LabelingTaskBuilder
{
    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var array
     */
    private $status = [];

    /**
     * @var array
     */
    private $frameNumberMapping = [];

    /**
     * @var string
     */
    private $taskType = Model\LabelingTask::TYPE_OBJECT_LABELING;

    /**
     * @var array
     */
    private $userAssignments = [];

    /**
     * @var bool
     */
    private $attentionTaskFlag = false;

    /**
     * @var \DateTime
     */
    private $creationDate;

    /**
     * @var array
     */
    private $labelStructure;

    /**
     * @var Model\TaskConfiguration
     */
    private $taskConfiguration;

    /**
     * @var string
     */
    private $drawingTool;

    /**
     * Declare a private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
        $this->frameNumberMapping = range(1, 661);
    }

    /**
     * @param Model\Project $project
     * @param Model\Video   $video
     *
     * @return LabelingTaskBuilder
     */
    public static function create(Model\Project $project, Model\Video $video)
    {
        $taskBuilder = new self();

        return $taskBuilder->withProject($project)->withVideo($video);
    }

    /**
     * @param Model\Project $project
     *
     * @return $this
     */
    public function withProject(Model\Project $project)
    {
        $this->project = $project;

        return $this;
    }

    /**
     * @param Model\Video $video
     *
     * @return $this
     */
    public function withVideo(Model\Video $video)
    {
        $this->video = $video;

        return $this;
    }

    /**
     * @param array $frameNumberMapping
     *
     * @return $this
     */
    public function withFrameNumberMapping(array $frameNumberMapping)
    {
        $this->frameNumberMapping = $frameNumberMapping;

        return $this;
    }

    /**
     * @param string $type
     *
     * @return $this
     */
    public function withTaskType(string $type)
    {
        $this->taskType = $type;

        return $this;
    }

    /**
     * @param Model\User     $user
     * @param                $phase
     * @param                $status
     * @param \DateTime|null $dateTime
     *
     * @return $this
     */
    public function withAddedUserAssignment(Model\User $user, $phase, $status, \DateTime $dateTime = null)
    {
        if ($dateTime === null) {
            $dateTime = new \DateTime();
        }
        $this->userAssignments[] = [
            'user'     => $user,
            'dateTime' => $dateTime,
            'phase'    => $phase,
            'status'   => $status,
        ];

        return $this;
    }

    /**
     * @param $phase
     * @param $status
     *
     * @return $this
     */
    public function withStatus(string $phase, string $status)
    {
        if ($phase === Model\LabelingTask::PHASE_REVIEW) {
            $this->status[Model\LabelingTask::PHASE_LABELING] = Model\LabelingTask::STATUS_DONE;
        }
        if ($phase === Model\LabelingTask::PHASE_REVISION) {
            $this->status[Model\LabelingTask::PHASE_LABELING] = Model\LabelingTask::STATUS_DONE;
            $this->status[Model\LabelingTask::PHASE_REVIEW]   = Model\LabelingTask::STATUS_DONE;
        }
        $this->status[$phase] = $status;

        return $this;
    }

    /**
     * @return $this
     */
    public function withAttentionTaskFlag()
    {
        $this->attentionTaskFlag = true;

        return $this;
    }

    /**
     * @param $labelStructure
     *
     * @return $this
     */
    public function withLabelStructure(array $labelStructure)
    {
        $this->labelStructure = $labelStructure;

        return $this;
    }

    /**
     * @param Model\TaskConfiguration $taskConfiguration
     *
     * @return $this
     */
    public function withTaskConfiguration(Model\TaskConfiguration $taskConfiguration)
    {
        $this->taskConfiguration = $taskConfiguration;

        return $this;
    }

    /**
     * @param string $drawingTool
     *
     * @return $this
     */
    public function withDrawingTool($drawingTool)
    {
        $this->drawingTool = $drawingTool;

        return $this;
    }

    /**
     * @return Model\LabelingTask
     */
    public function build()
    {
        $taskConfigurationId = null;
        if ($this->taskConfiguration instanceof Model\TaskConfiguration) {
            $taskConfigurationId = $this->taskConfiguration->getId();
        }
        $task = Model\LabelingTask::create(
            $this->video,
            $this->project,
            $this->frameNumberMapping,
            $this->taskType,
            $this->drawingTool,
            [],
            [],
            false,
            $taskConfigurationId
        );

        foreach ($this->userAssignments as $assignment) {
            $task->addAssignmentHistory(
                $assignment['phase'],
                $assignment['status'],
                $assignment['user'],
                $assignment['dateTime']
            );
        }

        foreach ($this->status as $phase => $status) {
            $task->setStatus($phase, $status);
        }

        $task->setTaskAttentionFlag($this->attentionTaskFlag);
        $task->setLabelStructure($this->labelStructure);

        return $task;
    }
}
