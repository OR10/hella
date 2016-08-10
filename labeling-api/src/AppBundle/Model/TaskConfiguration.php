<?php

namespace AppBundle\Model;

use AppBundle\Model\TaskExport\Exception;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

/**
 * @CouchDB\Document
 */
class TaskConfiguration
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
    private $name;

    /**
     * @CouchDB\Field(type="string")
     */
    private $filename;

    /**
     * @CouchDB\Attachments
     * @Serializer\Exclude
     */
    private $file;

    /**
     * @CouchDB\Field(type="string")
     */
    private $userId;

    /**
     * @CouchDB\Field(type="integer")
     */
    private $timestamp;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $json;

    /**
     * TaskConfiguraion constructor.
     *
     * @param      $name
     * @param      $filename
     * @param      $contentType
     * @param      $binaryData
     * @param      $userId
     * @param      $json
     * @param null $date
     *
     * @throws Exception\EmptyData
     */
    public function __construct($name, $filename, $contentType, $binaryData, $userId, $json, $date = null)
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

        if ($date === null) {
            $date = new \DateTime('now', new \DateTimeZone('UTC'));
        }

        $this->name      = $name;
        $this->filename  = $filename;
        $this->timestamp = $date->getTimestamp();
        $this->userId    = $userId;
        $this->json      = $json;

        $this->file[$this->filename] = \Doctrine\CouchDB\Attachment::createFromBinaryData(
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
     * @return mixed
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @return mixed
     */
    public function getFile()
    {
        return $this->file;
    }

    /**
     * @return mixed
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * @return mixed
     */
    public function getJson()
    {
        return $this->json;
    }
}
