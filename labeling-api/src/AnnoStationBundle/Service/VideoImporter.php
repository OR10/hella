<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\Jobs;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use crosscan\WorkerPool;
use Doctrine\ODM\CouchDB;

class VideoImporter
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @var Service\Video\MetaDataReader
     */
    private $metaDataReader;

    /**
     * @var Service\Video\VideoFrameSplitter
     */
    private $frameCdnSplitter;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\LabelStructure
     */
    private $labelStructureService;

    /**
     * @var CouchDbUpdateConflictRetry
     */
    private $couchDbUpdateConflictRetryService;

    /**
     * @var WorkerPool\Facade
     */
    private $facadeAMQP;

    /**
     * @var CalibrationFileConverter
     */
    private $calibrationFileConverter;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Facade\AdditionalFrameNumberMapping
     */
    private $additionalFrameNumberMappingFacade;

    /**
     * @param Facade\Project                      $projectFacade
     * @param Facade\Video                        $videoFacade
     * @param Facade\CalibrationData              $calibrationDataFacade
     * @param Facade\LabelingTask                 $labelingTaskFacade
     * @param Facade\AdditionalFrameNumberMapping $additionalFrameNumberMappingFacade
     * @param Video\MetaDataReader                $metaDataReader
     * @param Service\Video\VideoFrameSplitter    $frameCdnSplitter
     * @param LabelStructure                      $labelStructureService
     * @param CouchDbUpdateConflictRetry          $couchDbUpdateConflictRetryService
     * @param WorkerPool\Facade                   $facadeAMQP
     * @param CalibrationFileConverter            $calibrationFileConverter
     * @param Facade\TaskConfiguration            $taskConfigurationFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\CalibrationData $calibrationDataFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\AdditionalFrameNumberMapping $additionalFrameNumberMappingFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter,
        Service\LabelStructure $labelStructureService,
        Service\CouchDbUpdateConflictRetry $couchDbUpdateConflictRetryService,
        WorkerPool\Facade $facadeAMQP,
        Service\CalibrationFileConverter $calibrationFileConverter,
        Facade\TaskConfiguration $taskConfigurationFacade
    ) {
        $this->projectFacade                      = $projectFacade;
        $this->videoFacade                        = $videoFacade;
        $this->calibrationDataFacade              = $calibrationDataFacade;
        $this->metaDataReader                     = $metaDataReader;
        $this->frameCdnSplitter                   = $frameCdnSplitter;
        $this->labelingTaskFacade                 = $labelingTaskFacade;
        $this->labelStructureService              = $labelStructureService;
        $this->couchDbUpdateConflictRetryService  = $couchDbUpdateConflictRetryService;
        $this->facadeAMQP                         = $facadeAMQP;
        $this->calibrationFileConverter           = $calibrationFileConverter;
        $this->taskConfigurationFacade            = $taskConfigurationFacade;
        $this->additionalFrameNumberMappingFacade = $additionalFrameNumberMappingFacade;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param string                              $videoName
     * @param string                              $videoFilePath
     * @param bool                                $lossless
     *
     * @return Model\Video
     * @throws CouchDB\UpdateConflictException
     */
    public function importVideo(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $videoName,
        string $videoFilePath,
        bool $lossless
    ) {
        $imageTypes = $this->getImageTypes($lossless);
        $video      = new Model\Video($organisation, $videoName);

        $video->setMetaData($this->metaDataReader->readMetaData($videoFilePath));
        $this->videoFacade->save($video, $videoFilePath);

        $this->couchDbUpdateConflictRetryService->save(
            $project,
            function (Model\Project $project) use ($video) {
                $project->addVideo($video);
                $project->setDiskUsageInBytes($project->getDiskUsageInBytes() + $video->getMetaData()->sizeInBytes);
            }
        );

        foreach ($imageTypes as $imageTypeName) {
            $video->setImageType($imageTypeName, 'converted', false);
            $this->videoFacade->update();
        }

        foreach ($imageTypes as $imageTypeName) {
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $videoFilePath,
                ImageType\Base::create($imageTypeName)
            );

            $this->facadeAMQP->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return $video;
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project $project
     * @param array $imagesParam
     * @param bool $lossless
     * @return array
     */
    public function importZipImage(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        array $imagesParam,
        bool $lossless
    )
    {
        $newImages = [];
        $videos = [];

        foreach ($imagesParam as $videoFilePath => $videoName) {
            $imageTypes = $this->getImageTypes($lossless);
            $video = new Model\Video($organisation, $videoName);

            $video->setMetaData($this->metaDataReader->readMetaData($videoFilePath));
            $this->videoFacade->save($video, $videoFilePath, $project->getId());


            $this->couchDbUpdateConflictRetryService->save(
                $project,
                function (Model\Project $project) use ($video) {
                    $project->addVideo($video);
                    $project->setDiskUsageInBytes($project->getDiskUsageInBytes() + $video->getMetaData()->sizeInBytes);
                }
            );

            foreach ($imageTypes as $imageTypeName) {
                $video->setImageType($imageTypeName, 'converted', false);
                $this->videoFacade->update();
            }

            $newImages[$video->getName()] = $video->getSourceVideoPath($project->getId());
            $videos []=$video;
            // foreach ($imageTypes as $imageTypeName) {
            /*
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $videoFilePath,
                ImageType\Base::create($imageTypeName)
            );

            $this->facadeAMQP->addJob($job, WorkerPool\Facade::LOW_PRIO);
            */
            //$video = $this->videoFacade->find($video->getId());

            //video name + video source getSourceVideoPath
        }

        $frameSizesInBytes = $this->frameCdnSplitter->imageToFrame($project->getId(), $newImages, ImageType\Base::create('source'));

        $imageSizes        = $this->frameCdnSplitter->getImageSizes();
        $videoIndex = 1;
        foreach ($videos as $video) {
            $this->updateDocument(
                $video,
                ImageType\Base::create('source'),
                $imageSizes[$videoIndex][0],
                $imageSizes[$videoIndex][1],
                array_sum($frameSizesInBytes)
            );



            //find task by video id
            //NEED TO FIND TASK BY VIDEO IDS BY ALL Video in Task (In this case video is image)
            $tasks = $this->labelingTaskFacade->findByVideoIds([$video->getId()]);


            $projectIds = [];
            //change task video status
            foreach ($tasks as $task) {
                $projectIds[] = $task->getProjectId();
                $this->videoFacade->refresh($video);
                $this->couchDbUpdateConflictRetryService->save(
                    $task,
                    function (Model\LabelingTask $task) use ($video) {
                        $task->setStatusIfAllImagesAreConverted($video);
                    }
                );
            }
            $videoIndex++;
        }
        //foreach (array_unique($projectIds) as $projectId) {
        //    $job = new Jobs\CalculateProjectDiskSize($projectId);
        //    $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
        //}
        // }

        return $videos;
    }

    private function updateDocument(
        Model\Video $video,
        ImageType\Base $imageType,
        $width,
        $height,
        $frameSizesInBytes,
        $retryCount = 0,
        $maxRetries = 1
    ) {
        $imageTypeName = $imageType->getName();
        try {
            $this->videoFacade->refresh($video);
            $video->setImageType($imageTypeName, 'converted', true);
            $video->setImageType($imageTypeName, 'failed', false);
            $video->setImageType($imageTypeName, 'width', $width);
            $video->setImageType($imageTypeName, 'height', $height);
            $video->setAccumulatedSizeInBytesForType($imageTypeName, $frameSizesInBytes);
            $this->videoFacade->update();
        } catch (CouchDB\UpdateConflictException $updateConflictException) {
            if ($retryCount > $maxRetries) {
                throw $updateConflictException;
            }
            $this->updateDocument($video, $imageType, $retryCount + 1, $width, $height, $frameSizesInBytes);
        }
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param string                              $imageName
     * @param string                              $imageFilePath
     *
     * @return Model\Video
     * @throws CouchDB\UpdateConflictException
     */
    public function importImage(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $imageName,
        string $imageFilePath
    ) {
        // Compression state is determined by the given image type for now
        $imageFileExtension = pathinfo($imageFilePath, PATHINFO_EXTENSION);
        $lossless           = \strcasecmp($imageFileExtension, 'png') === 0;

        // Images may be mostly treated like videos, als ffmpeg can handle image input as well :)
        return $this->importVideo(
            $organisation,
            $project,
            $imageName,
            $imageFilePath,
            $lossless
        );
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     * @param string                              $calibrationFilePath
     *
     * @return Model\CalibrationData
     * @throws CouchDB\UpdateConflictException
     */
    public function importCalibrationData(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $calibrationFilePath,
        bool $isZip = false
    ) {
        $calibrationName = basename($calibrationFilePath);

        $this->calibrationFileConverter->setCalibrationData($calibrationFilePath);

        $calibration = new Model\CalibrationData($organisation, $calibrationName);

        $calibration->setRawCalibration($this->calibrationFileConverter->getRawData());
        $calibration->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
        $calibration->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
        $calibration->setTranslation($this->calibrationFileConverter->getTranslation());
        $calibration->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());

        $this->calibrationDataFacade->save($calibration);

        $this->couchDbUpdateConflictRetryService->save(
            $project,
            function (Model\Project $project) use ($calibration, $isZip) {
                $project->addCalibrationData($calibration, $isZip);
            }
        );

        return $calibration;
    }

    public function importAdditionalFrameNumberMapping(
        AnnoStationBundleModel\Organisation $organisation,
        Model\Project $project,
        string $additionalFrameNumberMappingFilePath
    ) {
        $additionalFrameNumberMapping = new AnnoStationBundleModel\AdditionalFrameNumberMapping(
            $organisation
        );

        $additionalFrameNumberMapping->setFrameNumberMapping(
            $this->getAdditionalFrameNumberMappingData($additionalFrameNumberMappingFilePath)
        );
        $additionalFrameNumberMapping->addAttachment(
            basename($additionalFrameNumberMappingFilePath),
            file_get_contents($additionalFrameNumberMappingFilePath),
            mime_content_type($additionalFrameNumberMappingFilePath)
        );
        $this->additionalFrameNumberMappingFacade->save($additionalFrameNumberMapping);

        $this->couchDbUpdateConflictRetryService->save(
            $project,
            function (Model\Project $project) use ($additionalFrameNumberMapping) {
                $project->addAdditionalFrameNumberMapping($additionalFrameNumberMapping);
            }
        );

        return $additionalFrameNumberMapping;
    }

    private function getAdditionalFrameNumberMappingData($filePath)
    {
        $data = array();
        foreach (preg_split("(\r\n|\r|\n)", file_get_contents($filePath), -1, PREG_SPLIT_NO_EMPTY) as $line) {
            if (empty($line)) {
                continue;
            }
            $lineData = str_getcsv($line, ';', '');
            if ($lineData[1] === 'true') {
                $data[] = (int) $lineData[0];
            }
        }

        return $data;
    }

    /**
     * Get the list of image types that should be generated for the task.
     *
     * TODO: Currently, we don't know how the image types are actually
     *       determined, so the list is hardcoded and depends only on wether or
     *       not we are allowed to use lossy compressed images or not but this
     *       will change in the future.
     *
     * @param bool $lossless
     *
     * @return array List of image types to generate for the task.
     */
    private function getImageTypes($lossless)
    {
        if ($lossless) {
            return ['source', 'thumbnail'];
        }

        return ['sourceJpg', 'thumbnail'];
    }
}
