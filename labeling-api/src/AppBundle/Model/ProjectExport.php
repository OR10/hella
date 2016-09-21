<?php

namespace AppBundle\Model;

use AppBundle\Model\ProjectExport\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class ProjectExport
{
    const EXPORT_STATUS_IN_WAITING = 'waiting';
    const EXPORT_STATUS_IN_PROGRESS = 'in_progress';
    const EXPORT_STATUS_DONE = 'done';
    const EXPORT_STATUS_ERROR = 'error';

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
    private $projectId;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $videoExportIds;

    /**
     * @CouchDB\Field(type="string")
     */
    private $filename;

    /**
     * @CouchDB\Field(type="datetime")
     */
    private $date;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $status = self::EXPORT_STATUS_IN_WAITING;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $errorMessage;

    /**
     * @param Project   $project
     * @param \DateTime $date
     */
    public function __construct(Project $project, \DateTime $date = null)
    {
        $this->projectId      = $project->getId();
        $this->date           = $date === null ? new \DateTime('now', new \DateTimeZone('UTC')) : clone $date;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get the id of the labeling task for which this export has data.
     *
     * @return string
     */
    public function getProjectId()
    {
        return $this->projectId;
    }

    /**
     * @return string[]
     */
    public function getVideoExportIds()
    {
        return $this->videoExportIds;
    }

    /**
     * @return mixed
     */
    public function getFilename()
    {
        return $this->filename;
    }

    /**
     * @param mixed $filename
     */
    public function setFilename($filename)
    {
        $this->filename = $filename;
    }

    /**
     * @param mixed $videoExportIds
     */
    public function setVideoExportIds($videoExportIds)
    {
        $this->videoExportIds = $videoExportIds;
    }

    /**
     * @return string
     */
    public function getStatus(): string
    {
        return $this->status;
    }

    /**
     * @param string $status
     */
    public function setStatus(string $status)
    {
        $this->status = $status;
    }

    /**
     * @return string
     */
    public function getErrorMessage(): string
    {
        return $this->errorMessage;
    }

    /**
     * @param string $errorMessage
     */
    public function setErrorMessage(string $errorMessage)
    {
        $this->errorMessage = $errorMessage;
    }

    /**
     * @return mixed
     */
    public function getDate()
    {
        return $this->date;
    }
}
