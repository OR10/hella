<?php

namespace AppBundle\Response;

use AppBundle\Model;
use AppBundle\Database\Facade;

class Video
{
    /**
     * @var array
     */
    private $result = [];

    /**
     * @param Model\Video            $video
     * @param Facade\CalibrationData $calibrationDataFacade
     */
    public function __construct(
        Model\Video $video,
        Facade\CalibrationData $calibrationDataFacade
    ) {
        $result = [
            'id' => $video->getId(),
            'rev' => $video->getRev(),
            'name' => $video->getName(),
            'metaData' => $video->getMetaData(),
            'imageTypes' => $video->getImageTypes(),
            'rawCalibration' => null,
            'calibration' => null,
        ];

        if ($video->getCalibrationId() !== null) {
            $calibrationData = $calibrationDataFacade->findById($video->getCalibrationId());
            $result['rawCalibration'] = $calibrationData->getRawCalibration();
            $result['calibration'] = $calibrationData->getCalibration();
        }

        $this->result = $result;
    }

    /**
     * @return array
     */
    public function getResult(): array
    {
        return $this->result;
    }
}
