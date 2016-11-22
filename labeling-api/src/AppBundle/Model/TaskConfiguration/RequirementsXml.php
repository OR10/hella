<?php
namespace AppBundle\Model\TaskConfiguration;

use AppBundle\Model\TaskConfiguration;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;

/**
 * @CouchDB\Document
 */
class RequirementsXml implements TaskConfiguration
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

    public function __construct($name, $filename, $contentType, $binaryData, $userId, $json, $date = null)
    {

    }

    public function getRawData()
    {
        // TODO: Implement getRawData() method.
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
    public function getRev()
    {
        return $this->rev;
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
    public function getFilename()
    {
        return $this->filename;
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

    public function isMetaLabelingConfiguration()
    {
        // TODO: Implement isMetaLabelingConfiguration() method.
    }
}