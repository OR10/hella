<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;

/**
 * Helper class to create projects.
 */
class ProjectBuilder
{
    /**
     * @var string|null
     */
    private $id = null;

    /**
     * @var string
     */
    private $name = 'Test project';

    /**
     * @var string
     */
    private $owningUserId;

    /**
     * @var string
     */
    private $currentStatus = Model\Project::STATUS_TODO;

    /**
     * @var array
     */
    private $statusChanges = [];

    /**
     * @var \DateTime
     */
    private $creationDate;

    /**
     * @var \DateTime
     */
    private $dueDate;

    /**
     * @var array
     */
    private $phases = [];

    /**
     * Declare a private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * @return ProjectBuilder
     */
    public static function create()
    {
        return new self();
    }

    /**
     * @param string $id
     *
     * @return ProjectBuilder
     */
    public function withId(string $id)
    {
        $this->id = $id;

        return $this;
    }

    /**
     * @param string $name
     *
     * @return ProjectBuilder
     */
    public function withName(string $name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @param string $userId
     *
     * @return ProjectBuilder
     */
    public function withProjectOwnedByUserId(string $userId)
    {
        $this->owningUserId = $userId;

        return $this;
    }

    /**
     * @param string          $status
     * @param \DateTime|null  $changedAt
     * @param Model\User|null $changedBy
     *
     * @return ProjectBuilder
     */
    public function withStatusChange(string $status, \DateTime $changedAt = null, Model\User $changedBy = null)
    {
        if ($changedAt === null) {
            if (empty($this->statusChanges)) {
                $changedAt = new \DateTime();
            } else {
                $changedAt = clone end($this->statusChanges)['changedAt'];
                $changedAt->modify('+1 second');
            }
        }

        $this->currentStatus   = $status;
        $this->statusChanges[] = [
            'status'    => $status,
            'changedAt' => $changedAt ?: new \DateTime(),
            'changedBy' => $changedBy,
        ];

        return $this;
    }

    /**
     * @param \DateTime $creationDate
     *
     * @return ProjectBuilder
     */
    public function withCreationDate(\DateTime $creationDate)
    {
        $this->creationDate = $creationDate;

        return $this;
    }

    /**
     * @param \DateTime $dueDate
     *
     * @return $this
     */
    public function withDueDate(\DateTime $dueDate)
    {
        $this->dueDate = $dueDate;

        return $this;
    }

    /**
     * @param array $phases
     *
     * @return $this
     */
    public function withPhases(array $phases)
    {
        $this->phases = $phases;

        return $this;
    }

    /**
     * @return array
     */
    public function buildArray()
    {
        return [
            'id'                         => $this->id,
            'name'                       => $this->name,
            'status'                     => $this->currentStatus,
            'finishedPercentage'         => 0,
            'creationTimestamp'          => $this->creationDate ? $this->creationDate->getTimestamp() : 0,
            'taskInPreProcessingCount'   => 0,
            'taskCount'                  => 0,
            'taskFinishedCount'          => 0,
            'taskInProgressCount'        => 0,
            'totalLabelingTimeInSeconds' => 0,
            'labeledThingInFramesCount'  => 0,
            'videosCount'                => 0,
            'dueTimestamp'               => null,
        ];
    }

    /**
     * @return Model\Project
     */
    public function build()
    {
        $creationDate = $this->creationDate === null ? null : clone $this->creationDate;

        $project = Model\Project::create($this->name, null, $creationDate, $this->dueDate, $this->phases, 1, 0, 0);

        if ($this->owningUserId !== null) {
            $project->setUserId($this->owningUserId);
        }

        foreach ($this->statusChanges as $change) {
            $project->addStatusHistory($change['changedBy'], $change['changedAt'], $change['status']);
        }

        return $project;
    }
}