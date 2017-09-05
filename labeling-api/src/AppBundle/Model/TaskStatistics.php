<?php

namespace AppBundle\Model;

use JMS\Serializer\Annotation as Serializer;

class TaskStatistics extends Base
{
    /**
     * @var LabelingTask
     * @Serializer\Groups({"statistics"})
     */
    private $task;

    /**
     * @var Video
     * @Serializer\Groups({"statistics"})
     */
    private $video;

    /**
     * @var int
     * @Serializer\Groups({"statistics"})
     */
    private $totalLabelingTimeInSeconds = 0;

    /**
     * @var int
     * @Serializer\Groups({"statistics"})
     */
    private $totalNumberOfLabeledThings = 0;

    /**
     * @param Video        $video
     * @param LabelingTask $task
     */
    public function __construct(Video $video, LabelingTask $task)
    {
        if ($video->getId() !== $task->getVideoId()) {
            throw new \InvalidArgumentException(
                sprintf(
                    "Task %s with videoId %s does not belong to video %s",
                    $task->getId(),
                    $task->getVideoId(),
                    $video->getId()
                )
            );
        }

        $this->task  = $task;
        $this->video = $video;
    }

    /**
     * @param int $totalLabelingTimeInSeconds
     */
    public function setTotalLabelingTimeInSeconds($totalLabelingTimeInSeconds)
    {
        $this->totalLabelingTimeInSeconds = (int) $totalLabelingTimeInSeconds;
    }

    /**
     * @param int $totalNumberOfLabeledThings
     */
    public function setTotalNumberOfLabeledThings($totalNumberOfLabeledThings)
    {
        $this->totalNumberOfLabeledThings = (int) $totalNumberOfLabeledThings;
    }
}
