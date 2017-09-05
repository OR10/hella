<?php

namespace AppBundle\Model;

use AppBundle\Model\TaskExport\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class TaskExport extends Base
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
    private $taskId;

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
     * @param LabelingTask $task
     * @param string       $filename
     * @param string       $contentType
     * @param string       $binaryData
     */
    public function __construct(LabelingTask $task, $filename, $contentType, $binaryData)
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

        $this->taskId   = $task->getId();
        $this->filename = $filename;

        $this->attachments[$this->filename] = \Doctrine\CouchDB\Attachment::createFromBinaryData(
            $binaryData,
            $contentType
        );
    }

    /**
     * Get the id of the labeling task for which this export has data.
     *
     * @return string
     */
    public function getTaskId()
    {
        return $this->taskId;
    }

    /**
     * Get the filename for the raw data attached to this document.
     *
     * @return string
     */
    public function getFilename()
    {
        if ($this->filename === null) {
            throw new \RuntimeException('Broken TaskExport document: missing filename');
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

        throw new \RuntimeException('Broken TaskExport document: missing attachment');
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

        throw new \RuntimeException('Broken TaskExport document: missing attachment');
    }
}
