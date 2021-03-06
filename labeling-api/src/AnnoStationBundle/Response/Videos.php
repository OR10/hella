<?php

namespace AnnoStationBundle\Response;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;

class Videos
{
    /**
     * @var array
     */
    private $result = [];

    /**
     * @param Model\Video            $videos []
     * @param Facade\CalibrationData $calibrationDataFacade
     */
    public function __construct(
        $videos,
        Facade\CalibrationData $calibrationDataFacade
    ) {
        $result = [];
        foreach ($videos as $video) {
            $videoResult = new Video($video, $calibrationDataFacade);
            $result[] = $videoResult->getResult();
        }

        $this->result = $result;
    }
}
