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
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * Video constructor.
     *
     * @param Facade\Video           $videoFacade
     * @param Facade\CalibrationData $calibrationDataFacade
     * @param Facade\LabelingTask    $labelingTaskFacade
     * @param Service\FrameCdn       $frameCdnService
     * @param Service\VideoCdn       $videoCdnService
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\CalibrationData $calibrationDataFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\FrameCdn $frameCdnService,
        Service\VideoCdn $videoCdnService
    ) {
        $this->videoFacade           = $videoFacade;
        $this->calibrationDataFacade = $calibrationDataFacade;
        $this->frameCdnService       = $frameCdnService;
        $this->videoCdnService       = $videoCdnService;
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $videos = $this->videoFacade->findAllForTasksIndexedById([$labelingTask]);
        /** @var Model\Video $video */
        foreach ($videos as $video) {
            if (count($this->labelingTaskFacade->findByVideoIds([$video->getId()])) > 1) {
                continue;
            }
            $this->frameCdnService->deleteVideoDirectory($video);
            $this->videoCdnService->deleteVideoDirectory($video);
            if ($video->getCalibrationId() !== null) {
                $calibrationData = $this->calibrationDataFacade->findById($video->getCalibrationId());
                if ($calibrationData !== null) {
                    $this->calibrationDataFacade->delete($calibrationData);
                }
            }
            $this->videoFacade->delete($video);
        }
    }
}
