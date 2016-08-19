<?php

namespace AppBundle\Model;

use AppBundle\Model\ProjectExport\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class Export
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
     * @param Project   $project
     * @param           $filename
     * @param           $binaryData
     * @param           $contentType
     * @param \DateTime $date
     */
    public function __construct(Project $project, $filename, $binaryData, $contentType, \DateTime $date = null)
    {
        $this->projectId   = $project->getId();
        if ($date === null) {
            $date = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->date = $date;

        $this->attachments[$filename] = \Doctrine\CouchDB\Attachment::createFromBinaryData(
            $binaryData,
            $contentType
        );
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
}
