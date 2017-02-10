<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Worker\Jobs;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Hagl\WorkerPoolBundle\JobInstruction;
use League\Flysystem;
use Doctrine\ODM\CouchDB;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Service;

class VideoFrameSplitter extends JobInstruction
{
    /**
     * @var VideoService\VideoFrameSplitter
     */
    private $videoFrameSplitter;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Flysystem\Filesystem
     */
    private $fileSystem;

    /**
     * @var string
     */
    private $cacheDir;

    /**
     * @var Service\VideoCdn
     */
    private $videoCdnService;

    /**
     * Video constructor.
     *
     * @param VideoService\VideoFrameSplitter $videoFrameSplitter
     * @param Facade\Video                    $videoFacade
     * @param Facade\LabelingTask             $labelingTaskFacade
     * @param Flysystem\Filesystem            $fileSystem
     * @param Service\VideoCdn                $videoCdnService
     * @param string                          $cacheDir
     */
    public function __construct(
        VideoService\VideoFrameSplitter $videoFrameSplitter,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Flysystem\Filesystem $fileSystem,
        Service\VideoCdn $videoCdnService,
        $cacheDir
    ) {
        $this->videoFrameSplitter = $videoFrameSplitter;
        $this->videoFacade        = $videoFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->fileSystem         = $fileSystem;
        $this->cacheDir           = $cacheDir;
        $this->videoCdnService    = $videoCdnService;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     *
     * @todo throw better exceptions
     */
    protected function runJob(Job $job, \crosscan\Logger\Facade\LoggerFacade $logger)
    {
        $tmpFile = tempnam($this->cacheDir, 'source_video');

        try {
            /** @var Model\Video $video */
            /** @var Jobs\VideoFrameSplitter $job */
            $video = $this->videoFacade->find($job->videoId);

            if ($video === null) {
                throw new \RuntimeException("Video '{$job->videoId}' could not be found");
            }

            if ($tmpFile === false) {
                throw new \RuntimeException('Error creating temporary file for video data');
            }

            if (file_put_contents($tmpFile, $this->videoCdnService->getVideo($video)) === false) {
                throw new \RuntimeException("Error writing video data to temporary file '{$tmpFile}'");
            }

            $frameSizesInBytes = $this->videoFrameSplitter->splitVideoInFrames($video, $tmpFile, $job->imageType);
            $imageSizes = $this->videoFrameSplitter->getImageSizes();

            $this->updateDocument($video, $job->imageType, $imageSizes[1][0], $imageSizes[1][1], $frameSizesInBytes);

            $tasks = $this->labelingTaskFacade->findByVideoIds([$video->getId()]);

            foreach ($tasks as $task) {
                $task->setStatusIfAllImagesAreConverted($video);
                $this->labelingTaskFacade->save($task);
            }
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
            $this->setFailure($job);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
            $this->setFailure($job);
        } finally {
            if (!unlink($tmpFile)) {
                throw new \RuntimeException("Error removing temporary file '{$tmpFile}'");
            }
        }
    }

    private function setFailure(Job $job)
    {
        $video = $this->videoFacade->find($job->videoId);
        $video->setImageType($job->imageType->getName(), 'converted', false);
        $video->setImageType($job->imageType->getName(), 'failed', true);
        $this->videoFacade->save($video);
        $tasks = $this->labelingTaskFacade->findByVideoIds([$video->getId()]);
        foreach ($tasks as $task) {
            $task->setStatus(
                Model\LabelingTask::PHASE_PREPROCESSING,
                Model\LabelingTask::STATUS_FAILED
            );
            $this->labelingTaskFacade->save($task);
        }
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param                $width
     * @param                $height
     * @param                $frameSizesInBytes
     * @param int            $retryCount
     * @param int            $maxRetries
     *
     * @throws CouchDB\UpdateConflictException
     * @internal param ImageType\Base $imageType
     */
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
            $video->setImageSizesForType($imageTypeName, $frameSizesInBytes);
            $this->videoFacade->update();
        } catch (CouchDB\UpdateConflictException $updateConflictException) {
            if ($retryCount > $maxRetries) {
                throw $updateConflictException;
            }
            $this->updateDocument($video, $imageType, $retryCount + 1, $width, $height, $frameSizesInBytes);
        }
    }

    /**
     * @param WorkerPool\Job $job
     *
     * @return bool
     */
    public function supports(WorkerPool\Job $job)
    {
        return $job instanceof Jobs\VideoFrameSplitter;
    }
}
