<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class Export
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
     * @var \DateTime
     * @CouchDB\Field(type="datetime")
     */
    private $date;

    /**
     * @CouchDB\Attachments
     * @Serializer\Exclude
     */
    private $attachments;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $status = self::EXPORT_STATUS_IN_WAITING;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $warningMessage;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $errorMessage;

    /**
     * @var string
     * @CouchDB\Field(type="string")
     */
    private $userId;

    /**
     * @param Project   $project
     * @param User      $user
     * @param \DateTime $date
     */
    public function __construct(Project $project, User $user = null, \DateTime $date = null)
    {
        $this->projectId = $project->getId();
        if ($date === null) {
            $date = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->date = $date;
        if ($user instanceof User) {
            $this->userId = $user->getId();
        }
    }

    /**
     * @param $filename
     * @param $binaryData
     * @param $contentType
     */
    public function addAttachment($filename, $binaryData, $contentType)
    {
        $this->attachments[$filename] = \Doctrine\CouchDB\Attachment::createFromBinaryData(
            $binaryData,
            $contentType
        );
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
     * @return mixed
     */
    public function getAttachments()
    {
        return $this->attachments;
    }

    /**
     * @return \DateTime
     */
    public function getDate()
    {
        return $this->date;
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
     * @return string
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * @param string $warningMessage
     */
    public function setWarningMessage(string $warningMessage)
    {
        $this->warningMessage = $warningMessage;
    }
}
