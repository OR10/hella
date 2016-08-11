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
     * @param array     $exportVideoIds
     * @param           $filename
     * @param \DateTime $date
     */
    public function __construct(Project $project, array $exportVideoIds, $filename, \DateTime $date = null)
    {
        $this->projectId      = $project->getId();
        $this->videoExportIds = $exportVideoIds;
        $this->filename       = $filename;
        if ($date === null) {
            $date = new \DateTime('now', new \DateTimeZone('UTC'));
        }
        $this->date = $date;
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
