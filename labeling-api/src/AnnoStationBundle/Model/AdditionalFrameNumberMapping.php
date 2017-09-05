<?php

namespace AnnoStationBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model as AppBundleModel;

/**
 * @CouchDB\Document
 */
class AdditionalFrameNumberMapping extends AppBundleModel\Base
{
    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $frameNumberMapping;

    /**
     * @CouchDB\Field(type="string")
     */
    protected $organisationId;

    /**
     * @CouchDB\Attachments
     * @Serializer\Exclude
     */
    private $attachments = [];

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     */
    public function __construct(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->organisationId = $organisation->getId();
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $frameNumberMapping
     */
    public function setFrameNumberMapping($frameNumberMapping)
    {
        $this->frameNumberMapping = $frameNumberMapping;
    }

    /**
     * @return string|null
     */
    public function getFileName()
    {
        $filenames = array_keys($this->attachments);
        if (isset($filenames[0])) {
            return $filenames[0];
        }

        return null;
    }

    /**
     * @return mixed
     */
    public function getAttachment()
    {
        if (isset($this->attachments[$this->getFileName()])) {
            return $this->attachments[$this->getFileName()]->getRawData();
        }

        throw new \RuntimeException('File not found: ' . $this->getFileName());
    }

    /**
     * @param $filename
     * @param $binaryData
     * @param $contentType
     */
    public function addAttachment($filename, $binaryData, $contentType)
    {
        $this->attachments[$filename] = \Doctrine\CouchDB\Attachment::createFromBinaryData(
            $binaryData,
            $contentType
        );
    }

    /**
     * @return mixed
     */
    public function getFrameNumberMapping()
    {
        return $this->frameNumberMapping;
    }
}
