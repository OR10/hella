<?php

namespace AnnoStationBundle\Tests\Helper;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;

class VideoBuilder
{
    /**
     * @var string
     */
    private $name = 'Test Video';

    /**
     * @var string
     */
    private $imageType = 'sourceJpg';

    /**
     * @var int
     */
    private $numberOfFrames = 661;

    /**
     * @var Model\CalibrationData
     */
    private $calibrationData = null;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    /**
     * Declare private constructor to enforce usage of fluent interface.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     */
    private function __construct(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->organisation = $organisation;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return VideoBuilder
     */
    public static function create(AnnoStationBundleModel\Organisation $organisation)
    {
        return new self($organisation);
    }

    /**
     * @param string $name
     *
     * @return $this
     */
    public function withName(string $name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @param string $imageType
     *
     * @return $this
     */
    public function withImageType(string $imageType)
    {
        $this->imageType = $imageType;

        return $this;
    }

    /**
     * @param int $numberOfFrames
     */
    public function withNumberOfFrames(int $numberOfFrames)
    {
        $this->numberOfFrames = $numberOfFrames;
    }

    /**
     * @param Model\CalibrationData $calibrationData
     *
     * @return $this
     */
    public function withCalibrationData(Model\CalibrationData $calibrationData)
    {
        $this->calibrationData = $calibrationData;

        return $this;
    }

    /**
     * @return Model\Video
     */
    public function build()
    {
        $video = Model\Video::create($this->organisation, $this->name);
        $video->setImageType($this->imageType, 'converted', false);
        if ($this->calibrationData !== null) {
            $video->setCalibrationData($this->calibrationData);
        }

        $metadata = new Model\Video\MetaData();
        $metadata->numberOfFrames = $this->numberOfFrames;

        $video->setMetaData($metadata);

        return $video;
    }
}
