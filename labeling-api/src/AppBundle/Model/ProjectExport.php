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
     * @param Project $project
     * @param array $exportVideoIds
     */
    public function __construct(Project $project, array $exportVideoIds, $filename)
    {
        $this->projectId      = $project->getId();
        $this->videoExportIds = $exportVideoIds;
        $this->filename       = $filename;
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
