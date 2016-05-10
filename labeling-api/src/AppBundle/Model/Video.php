<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use JMS\Serializer\Annotation as Serializer;

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
     * @CouchDB\Field(type="mixed")
     */
    private $rawCalibration;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $calibration;

    /**
     * Static factory method for easy use of the fluent interface.
     *
     * @param string $name
     */
    public static function create($name)
    {
        return new static($name);
    }

    /**
     * @param string $name The name of the video.
     */
    public function __construct($name)
    {
        $this->name = (string) $name;
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
     * @return Video
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @param Video\MetaData
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
     */
    public function isImageTypeConverted($imageType)
    {
        if (isset($this->imageTypes[$imageType]['converted'])) {
            return $this->imageTypes[$imageType]['converted'];
        }
        return false;
    }

    /**
     * @param mixed $cameraMatrix
     */
    public function setCameraMatrix($cameraMatrix)
    {
        $this->calibration['cameraMatrix'] = $cameraMatrix;
    }

    /**
     * @param mixed $rotationMatrix
     */
    public function setRotationMatrix($rotationMatrix)
    {
        $this->calibration['rotationMatrix'] = $rotationMatrix;
    }

    /**
     * @param mixed $translation
     */
    public function setTranslation($translation)
    {
        $this->calibration['translation'] = $translation;
    }

    /**
     * @param mixed $distortionCoefficients
     */
    public function setDistortionCoefficients($distortionCoefficients)
    {
        $this->calibration['distortionCoefficients'] = $distortionCoefficients;
    }

    /**
     * @return mixed
     */
    public function getRawCalibration()
    {
        return $this->rawCalibration;
    }

    /**
     * @param mixed $rawCalibration
     */
    public function setRawCalibration($rawCalibration)
    {
        $this->rawCalibration = $rawCalibration;
    }

    /**
     * @return mixed
     */
    public function getCalibration()
    {
        return $this->calibration;
    }
}
