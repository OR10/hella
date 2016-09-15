<?php

namespace AppBundle\Model;

use AppBundle\Model\ProjectExport\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class VideoExport
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
    private $videoId;

    /**
     * @CouchDB\Field(type="string")
     */
    private $filename;

    /**
     * @CouchDB\Attachments
     * @Serializer\Exclude
     */
    private $attachments;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $taskIds;

    /**
     * @param Video $video
     * @param array $tasks
     * @param string $filename
     * @param string $contentType
     * @param string $binaryData
     * @throws Exception\EmptyData
     */
    public function __construct(Video $video, array $tasks, $filename, $contentType, $binaryData)
    {
        if (!is_string($filename) || empty($filename)) {
            throw new \InvalidArgumentException('Invalid filename');
        }

        if (!is_string($contentType) || empty($contentType)) {
            throw new \InvalidArgumentException('Invalid content type');
        }

        if (!is_string($binaryData)) {
            throw new \InvalidArgumentException('Expecting binary data as string');
        }

        if (empty($binaryData)) {
            throw new Exception\EmptyData();
        }

        $this->videoId = $video->getId();
        $this->filename  = $filename;

        $this->attachments[$this->filename] = \Doctrine\CouchDB\Attachment::createFromBinaryData(
            $binaryData,
            $contentType
        );
        $this->taskIds = array_map(function(LabelingTask $task) {
            return $task->getId();
        }, $tasks);
    }

    /**
     * Get the id of the labeling task for which this export has data.
     *
     * @return string
     */
    public function getVideoId()
    {
        return $this->videoId;
    }

    /**
     * Get the filename for the raw data attached to this document.
     *
     * @return string
     */
    public function getFilename()
    {
        if ($this->filename === null) {
            throw new \RuntimeException('Broken VideoExport document: missing filename');
        }

        return $this->filename;
    }

    /**
     * Get the content type of the exported data returned by `getRawData`.
     *
     * @return string
     */
    public function getContentType()
    {
        $filename = $this->getFilename();

        if (isset($this->attachments[$filename])) {
            return $this->attachments[$filename]->getContentType();
        }

        throw new \RuntimeException('Broken VideoExport document: missing attachment');
    }

    /**
     * Return a string containing the raw data of the export.
     *
     * @return string
     */
    public function getRawData()
    {
        $filename = $this->getFilename();

        if (isset($this->attachments[$filename])) {
            return $this->attachments[$filename]->getRawData();
        }

        throw new \RuntimeException('Broken VideoExport document: missing attachment');
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }
}
