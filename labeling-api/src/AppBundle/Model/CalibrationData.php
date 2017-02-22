<?php

namespace AppBundle\Model;

use Doctrine\ODM\CouchDB\Mapping\Annotations as CouchDB;
use AnnoStationBundle\Model as AnnoStationBundleModel;

/**
 * @CouchDB\Document
 */
class CalibrationData
{
    /**
     * @CouchDB\Id
     */
    private $id;

    /**
     * @CouchDB\Field(type="string")
     */
    private $name;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $rawCalibration;

    /**
     * @CouchDB\Field(type="mixed")
     */
    private $calibration;

    /**
     * @CouchDB\Field(type="string")
     */
    protected $organisationId;

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param string                              $name
     */
    public function __construct(AnnoStationBundleModel\Organisation $organisation, string $name)
    {
        $this->organisationId = $organisation->getId();
        $this->name           = $name;
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
     * @return mixed
     */
    public function getRawCalibration()
    {
        return $this->rawCalibration;
    }

    /**
     * @return mixed
     */
    public function getCalibration()
    {
        return $this->calibration;
    }

    /**
     * @param mixed $rawCalibration
     */
    public function setRawCalibration($rawCalibration)
    {
        $this->rawCalibration = $rawCalibration;
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
    public function getCameraMatrix()
    {
        return $this->calibration['cameraMatrix'];
    }

    /**
     * @return mixed
     */
    public function getRotationMatrix()
    {
        return $this->calibration['rotationMatrix'];
    }

    /**
     * @return mixed
     */
    public function getTranslation()
    {
        return $this->calibration['translation'];
    }

    /**
     * @return mixed
     */
    public function getDistortionCoefficients()
    {
        return $this->calibration['distortionCoefficients'];
    }

    /**
     * @param mixed $organisationId
     */
    public function setOrganisationId($organisationId)
    {
        $this->organisationId = $organisationId;
    }
}
