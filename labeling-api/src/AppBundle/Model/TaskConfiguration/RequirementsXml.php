<?php
namespace AppBundle\Model\TaskConfiguration;

use AppBundle\Model\TaskConfiguration;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AnnoStationBundle\Model as AnnoStationBundleModel;

/**
 * @CouchDB\Document
 */
class RequirementsXml implements TaskConfiguration
{
    const TYPE = 'requirements';

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
     * @CouchDB\Field(type="mixed")
     */
    private $hashes;

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

        $this->organisationId          = $organisation->getId();
        $this->name                    = $name;
        $this->filename                = $filename;
        $this->timestamp               = $date->getTimestamp();
        $this->userId                  = $userId;
        $this->json                    = $json;
        $this->hashes[$this->filename] = hash('sha256', $binaryData);

        $this->file[$this->filename] = \Doctrine\CouchDB\Attachment::createFromBinaryData(
            $binaryData,
            $contentType
        );
    }

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

    public function getType()
    {
        return self::TYPE;
    }

    /**
     * @return mixed
     */
    public function getHashes($filename)
    {
        if (!isset($this->hashes[$filename])) {
            return null;
        }

        return $this->hashes[$filename];
    }
}
