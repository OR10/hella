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

        $conflictException = null;
        for ($retries = 0; $retries < 5; ++$retries) {
            $conflictException = null;
            try {
                $project->addVideo($video);
                $videoSize = $video->getMetaData()->sizeInBytes;
                $project->setDiskUsageInBytes($project->getDiskUsageInBytes() + $videoSize);
                $this->projectFacade->save($project);
                break;
            } catch (CouchDB\UpdateConflictException $exception) {
                $conflictException = $exception;
                $this->projectFacade->reload($project);
            }
        }

        if ($conflictException !== null) {
            throw $conflictException;
        }

        foreach ($imageTypes as $imageTypeName) {
            $video->setImageType($imageTypeName, 'converted', false);
            $this->videoFacade->update();
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $video->getSourceVideoPath(),
                ImageType\Base::create($imageTypeName)
            );

            $this->facadeAMQP->addJob($job, WorkerPool\Facade::LOW_PRIO);
        }

        return $video;
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
        string $calibrationFilePath
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

        $conflictException = null;
        for ($retries = 0; $retries < 5; ++$retries) {
            $conflictException = null;
            try {
                $project->addCalibrationData($calibration);
                $this->projectFacade->save($project);
                break;
            } catch (CouchDB\UpdateConflictException $exception) {
                $conflictException = $exception;
                $this->projectFacade->reload($project);
            }
        }

        if ($conflictException !== null) {
            throw $conflictException;
        }

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

        $conflictException = null;
        for ($retries = 0; $retries < 5; ++$retries) {
            $conflictException = null;
            try {
                $project->addAdditionalFrameNumberMapping($additionalFrameNumberMapping);
                $this->projectFacade->save($project);
                break;
            } catch (CouchDB\UpdateConflictException $exception) {
                $conflictException = $exception;
                $this->projectFacade->reload($project);
            }
        }

        if ($conflictException !== null) {
            throw $conflictException;
        }

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
