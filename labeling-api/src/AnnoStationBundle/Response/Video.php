<?php

namespace AnnoStationBundle\Response;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

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
        $imageTypes = array_map(function($type) {
            unset($type['sizeInBytes']);

            return $type;
        }, $video->getImageTypes());

        $result = [
            'id' => $video->getId(),
            'rev' => $video->getRev(),
            'name' => $video->getName(),
            'metaData' => $video->getMetaData(),
            'imageTypes' => $imageTypes,
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
