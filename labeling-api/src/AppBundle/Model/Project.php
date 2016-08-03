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
     * @CouchDB\Field(type="string")
     */
    private $coordinator = null;

    /**
     * @CouchDB\Field(type="string")
     */
    private $labelingGroupId;

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
    public function getCoordinator()
    {
        return $this->coordinator;
    }

    /**
     * @param CouchDB\Field $coordinator
     */
    public function setCoordinator($coordinator)
    {
        $this->coordinator = $coordinator;
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
}
