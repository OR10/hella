<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;

class Video
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @var Service\FrameCdn
     */
    private $frameCdnService;

    /**
     * @var Service\VideoCdn
     */
    private $videoCdnService;

    /**
     * Video constructor.
     *
     * @param Facade\Video           $videoFacade
     * @param Facade\CalibrationData $calibrationDataFacade
     * @param Service\FrameCdn       $frameCdnService
     * @param Service\VideoCdn       $videoCdnService
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\CalibrationData $calibrationDataFacade,
        Service\FrameCdn $frameCdnService,
        Service\VideoCdn $videoCdnService
    ) {
        $this->videoFacade           = $videoFacade;
        $this->calibrationDataFacade = $calibrationDataFacade;
        $this->frameCdnService       = $frameCdnService;
        $this->videoCdnService       = $videoCdnService;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $videos = $this->videoFacade->findAllForTasksIndexedById([$labelingTask]);
        /** @var Model\Video $video */
        foreach ($videos as $video) {
            $this->frameCdnService->deleteVideoDirectory($video);
            $this->videoCdnService->deleteVideoDirectory($video);
            $calibrationData = $this->calibrationDataFacade->findById($video->getCalibrationId());
            $this->calibrationDataFacade->delete($calibrationData);
            $this->videoFacade->delete($video);
        }
    }
}
