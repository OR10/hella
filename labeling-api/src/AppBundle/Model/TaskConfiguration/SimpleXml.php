<?php
namespace AppBundle\Model\TaskConfiguration;

use AppBundle\Model\TaskConfiguration;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AnnoStationBundle\Model as AnnoStationBundleModel;

/**
 * @CouchDB\Document
 */
class SimpleXml implements TaskConfiguration
{
    const TYPE = 'simple';

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
    protected $organisationId;

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
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $name
     * @param                                     $filename
     * @param                                     $contentType
     * @param                                     $binaryData
     * @param                                     $userId
     * @param                                     $json
     * @param null                                $date
     *
     * @throws Exception\EmptyData
     */
    public function __construct(
        AnnoStationBundleModel\Organisation $organisation,
        $name,
        $filename,
        $contentType,
        $binaryData,
        $userId,
        $json,
        $date = null
    ) {
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

        $this->organisationId = $organisation->getId();
        $this->name           = $name;
        $this->filename       = $filename;
        $this->timestamp      = $date->getTimestamp();
        $this->userId         = $userId;
        $this->json           = $json;

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

    /**
     * Get the filename for the raw data attached to this document.
     *
     * @return string
     */
    public function getFilename()
    {
        if ($this->filename === null) {
            throw new \RuntimeException('Broken Configuration document: missing filename');
        }

        return $this->filename;
    }

    /**
     * Return a string containing the raw data of the export.
     *
     * @return string
     */
    public function getRawData()
    {
        $filename = $this->getFilename();

        if (isset($this->file[$filename])) {
            return $this->file[$filename]->getRawData();
        }

        throw new \RuntimeException('Broken Configuration document: missing attachment');
    }



    public function getContentType()
    {
        $filename = $this->getFilename();

        if (isset($this->file[$filename])) {
            return $this->file[$filename]->getContentType();
        }

        throw new \RuntimeException('Broken Configuration document: missing attachment');
    }

    /**
     * Quickly access information about whether this is a meta labeling configuration or not.
     *
     * @return bool
     */
    public function isMetaLabelingConfiguration()
    {
        $json = $this->getJson();
        if (!array_key_exists('isMetaLabelingConfiguration', $json)) {
            return false;
        }

        return $json['isMetaLabelingConfiguration'];
    }

    public function getType()
    {
        return self::TYPE;
    }

    /**
     * @return mixed
     */
    public function getOrganisationId()
    {
        return $this->organisationId;
    }

    /**
     * @param mixed $organisationId
     */
    public function setOrganisationId($organisationId)
    {
        $this->organisationId = $organisationId;
    }
}
