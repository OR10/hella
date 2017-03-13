<?php

namespace AppBundle\Model;

use AppBundle\Model\Video\MetaData;
use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;
use AnnoStationBundle\Model as AnnoStationBundleModel;

/**
 * @CouchDB\Document
 */
class Video
{
    /**
     * @CouchDB\Id
     * @Serializer\Groups({"statistics"})
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
     * @Serializer\Groups({"statistics"})
     */
    private $name;

    /**
     * @var Video\MetaData
     * @CouchDB\Field(type="mixed")
     */
    private $metaData;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $imageTypes;

    /**
     * @var string
     *
     * @CouchDB\Field(type="string")
     */
    private $calibrationId;

    /**
     * Static factory method for easy use of the fluent interface.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param string                              $name
     *
     * @return Video
     */
    public static function create(AnnoStationBundleModel\Organisation $organisation, $name)
    {
        return new static($organisation, $name);
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param string                              $name The name of the video.
     */
    public function __construct(AnnoStationBundleModel\Organisation $organisation, $name)
    {
        $this->organisationId = $organisation->getId();
        $this->name           = (string) $name;
    }

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return Video
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @param Video\MetaData
     *
     * @return Video
     */
    public function setMetaData(Video\MetaData $metaData)
    {
        $this->metaData = $metaData;

        return $this;
    }

    /**
     * @return Video\MetaData
     */
    public function getMetaData()
    {
        if (is_array($this->metaData)) {
            $metaData = new MetaData();
            $properties = ['format', 'width', 'height', 'fps', 'duration', 'sizeInBytes', 'numberOfFrames', 'raw'];
            foreach ($properties as $property) {
                $metaData->$property = $this->metaData[$property];
            }
            $this->metaData = $metaData;
        }

        return $this->metaData;
    }

    /**
     * @return string
     */
    public function getSourceVideoPath()
    {
        if ($this->getId() === null) {
            throw new \LogicException('Trying to use id of not persisted video');
        }

        return $this->getId() . DIRECTORY_SEPARATOR . 'source';
    }

    /**
     * @return mixed
     */
    public function getImageTypes()
    {
        return $this->imageTypes;
    }

    /**
     * @param $imageType
     * @param $key
     * @param $value
     *
     * @return Video
     */
    public function setImageType($imageType, $key, $value)
    {
        $this->imageTypes[$imageType][$key] = $value;

        return $this;
    }

    /**
     * @param string $imageType
     *
     * @return boolean
     */
    public function hasImageType($imageType)
    {
        return isset($this->imageTypes[$imageType]);
    }

    /**
     * @param string $imageType
     *
     * @return bool
     */
    public function isImageTypeConverted($imageType)
    {
        if (isset($this->imageTypes[$imageType]['converted'])) {
            return $this->imageTypes[$imageType]['converted'];
        }

        return false;
    }

    /**
     * @param $type
     * @param $frameSizesInBytes
     */
    public function setImageSizesForType($type, $frameSizesInBytes)
    {
        $this->imageTypes[$type]['sizeInBytes'] = $frameSizesInBytes;
    }

    /**
     * @param $calibrationId
     */
    public function setCalibrationId($calibrationId)
    {
        $this->calibrationId = $calibrationId;
    }

    /**
     * @return mixed
     */
    public function getCalibrationId()
    {
        return $this->calibrationId;
    }

    /**
     * @return mixed
     */
    public function getRev()
    {
        return $this->rev;
    }

    /**
     * @param CalibrationData $calibrationData
     */
    public function setCalibrationData(CalibrationData $calibrationData)
    {
        $this->setCalibrationId($calibrationData->getId());
    }

    /**
     * @param mixed $organisationId
     */
    public function setOrganisationId($organisationId)
    {
        $this->organisationId = $organisationId;
    }
}
