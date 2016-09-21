<?php

namespace AppBundle\Tests\Helper;

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
     * @return Model\LabelingTask
     */
    public function build()
    {
        $task = Model\LabelingTask::create($this->video, $this->project, $this->frameNumberMapping, $this->taskType);

        foreach ($this->status as $phase => $status) {
            $task->setStatus($phase, $status);
        }

        return $task;
    }
}