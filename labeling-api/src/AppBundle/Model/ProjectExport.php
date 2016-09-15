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
     * @param Project   $project
     * @param string[]  $exportVideoIds
     * @param string    $filename
     * @param \DateTime $date
     */
    public function __construct(Project $project, array $exportVideoIds, string $filename, \DateTime $date = null)
    {
        $this->projectId      = $project->getId();
        $this->videoExportIds = $exportVideoIds;
        $this->filename       = $filename;
        $this->date           = $date === null ? new \DateTime('now', new \DateTimeZone('UTC')) : clone $date;
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
}
