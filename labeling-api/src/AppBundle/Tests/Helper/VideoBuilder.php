<?php

namespace AppBundle\Tests\Helper;

use AppBundle\Model;

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
     * Declare private constructor to enforce usage of fluent interface.
     */
    private function __construct()
    {
    }

    /**
     * @return VideoBuilder
     */
    public static function create()
    {
        return new self();
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
        $video = Model\Video::create($this->name);
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