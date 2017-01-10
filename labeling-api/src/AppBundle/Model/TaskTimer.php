<?php

namespace AppBundle\Model;

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
     * @CouchDB\Field(type="string")
     */
    private $projectId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $userId;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $timeInSeconds = [LabelingTask::PHASE_LABELING => 0];

    /**
     * @param LabelingTask $task
     * @param User         $user
     * @param int          $timeInSeconds
     */
    public function __construct(LabelingTask $task, User $user, $timeInSeconds = 0)
    {
        $this->taskId                                      = $task->getId();
        $this->projectId                                   = $task->getProjectId();
        $this->userId                                      = $user->getId();
        $this->timeInSeconds[LabelingTask::PHASE_LABELING] = (int)$timeInSeconds;
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
     * @param $phase
     * @return int
     */
    public function getTimeInSeconds($phase)
    {
        if (!isset($this->timeInSeconds[$phase])) {
            return 0;
        }

        return $this->timeInSeconds[$phase];
    }

    /**
     * @param     $phase
     * @param int $timeInSeconds
     */
    public function setTimeInSeconds($phase, $timeInSeconds)
    {
        $this->timeInSeconds[$phase] = (int) $timeInSeconds;
    }

    /**
     * @return string
     */
    public function getProjectId()
    {
        return $this->projectId;
    }
}
