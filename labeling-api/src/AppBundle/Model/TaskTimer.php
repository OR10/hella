<?php

namespace AppBundle\Model;

use AppBundle\Model\TaskExport\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class TaskTimer
{
    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Version
     */
    private $rev;

    /**
     * @CouchDB\Field(type="string")
     */
    private $taskId;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $userId;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $timeInSeconds = 0;

    /**
     * @param LabelingTask $task
     * @param Use r        $user
     * @param int          $timeInSeconds
     */
    public function __construct(LabelingTask $task, User $user, $timeInSeconds = 0)
    {
        $this->taskId        = $task->getId();
        $this->userId        = $user->getId();
        $this->timeInSeconds = (int) $timeInSeconds;
    }

    /**
     * Get the id of the labeling task for which this export has data.
     *
     * @return string
     */
    public function getTaskId()
    {
        return $this->taskId;
    }

    /**
     * Get the associated user id.
     *
     * @return int
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * @return int
     */
    public function getTimeInSeconds()
    {
        return $this->timeInSeconds;
    }

    /**
     * @param int $timeInSeconds
     */
    public function setTimeInSeconds($timeInSeconds)
    {
        $this->timeInSeconds = (int) $timeInSeconds;
    }
}
