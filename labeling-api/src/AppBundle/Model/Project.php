<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class Project
{
    const STATUS_TODO = 'todo';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_DONE = 'done';

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
    private $name;

    /**
     * @CouchDB\Field(type="datetime")
     */
    private $creationDate;

    /**
     * @CouchDB\Field(type="datetime")
     */
    private $dueDate;

    /**
     * @CouchDB\Field(type="string")
     */
    private $status = self::STATUS_TODO;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $coordinatorAssignmentHistory = null;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labelingGroupId;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $availableExports = ['legacy'];

    /**
     * Static factory method for easy use of the fluent interface.
     *
     * @param string $name
     *
     * @param null   $creationDate
     * @param null   $dueDate
     * @return static
     */
    public static function create($name, $creationDate = null, $dueDate = null)
    {
        return new static($name, $creationDate, $dueDate);
    }

    /**
     * @param string $name
     * @param null   $creationDate
     * @param null   $dueDate
     */
    public function __construct($name, $creationDate = null, $dueDate = null)
    {
        if ($creationDate === null) {
            $creationDate = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->name         = (string)$name;
        $this->creationDate = $creationDate;
        $this->dueDate      = $dueDate;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return Video
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getCreationDate()
    {
        if ($this->creationDate instanceof \DateTime) {
            return $this->creationDate->getTimestamp();
        }

        return null;
    }

    /**
     * @return mixed
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * @param mixed $status
     */
    public function setStatus($status)
    {
        $this->status = $status;
    }

    /**
     * @return mixed
     */
    public function getDueDate()
    {
        if ($this->dueDate instanceof \DateTime) {
            return $this->dueDate->getTimestamp();
        }

        return null;
    }

    /**
     * @return CouchDB\Field
     */
    public function getCoordinatorAssignmentHistory()
    {
        return $this->coordinatorAssignmentHistory;
    }

    /**
     * @param User      $user
     * @param \DateTime $date
     */
    public function addCoordinatorAssignmentHistory(User $user = null, \DateTime $date = null)
    {
        if ($date === null) {
            $date = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->coordinatorAssignmentHistory[] = array(
            'userId' => $user->getId(),
            'assignedAt' => $date->getTimestamp(),
            'status' => $this->getStatus(),
        );
    }

    /**
     * @return null
     */
    public function getLatestAssignedCoordinatorUserId()
    {
        $historyEntries = $this->getCoordinatorAssignmentHistory();
        if (empty($historyEntries)) {
            return null;
        }

        usort($historyEntries, function ($a, $b) {
            if ($a['assignedAt'] === $b['assignedAt']) {
                return 0;
            }
            return ($a['assignedAt'] > $b['assignedAt']) ? -1 : 1;
        });

        return $historyEntries[0]['userId'];
    }

    /**
     * @param mixed $creationDate
     */
    public function setCreationDate($creationDate)
    {
        $this->creationDate = $creationDate;
    }

    /**
     * @return mixed
     */
    public function getLabelingGroupId()
    {
        return $this->labelingGroupId;
    }

    /**
     * @param mixed $labelingGroupId
     */
    public function setLabelingGroupId($labelingGroupId)
    {
        $this->labelingGroupId = $labelingGroupId;
    }

    /**
     * @param mixed $availableExports
     */
    public function setAvailableExports($availableExports)
    {
        $this->availableExports = $availableExports;
    }

    /**
     * @return mixed
     */
    public function getAvailableExports()
    {
        return $this->availableExports;
    }
}
