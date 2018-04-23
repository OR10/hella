<?php

namespace AnnoStationBundle\Worker\JobInstruction;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Video as VideoService;
use AnnoStationBundle\Worker\Jobs;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Job;
use Doctrine\ODM\CouchDB;
use Hagl\WorkerPoolBundle\JobInstruction;
use League\Flysystem;
use crosscan\WorkerPool\AMQP;

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
     * @var Service\CouchDbUpdateConflictRetry
     */
    private $couchDbUpdateConflictRetryService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var AMQP\FacadeAMQP
     */
    private $amqpFacade;

    /**
     * Video constructor.
     *
     * @param VideoService\VideoFrameSplitter    $videoFrameSplitter
     * @param Facade\Video                       $videoFacade
     * @param Facade\LabelingTask                $labelingTaskFacade
     * @param Facade\Project                     $projectFacade
     * @param AMQP\FacadeAMQP                    $amqpFacade
     * @param Flysystem\Filesystem               $fileSystem
     * @param Service\VideoCdn                   $videoCdnService
     * @param Service\CouchDbUpdateConflictRetry $couchDbUpdateConflictRetryService
     * @param string                             $cacheDir
     */
    public function __construct(
        VideoService\VideoFrameSplitter $videoFrameSplitter,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade,
        AMQP\FacadeAMQP $amqpFacade,
        Flysystem\Filesystem $fileSystem,
        Service\VideoCdn $videoCdnService,
        Service\CouchDbUpdateConflictRetry $couchDbUpdateConflictRetryService,
        $cacheDir
    ) {
        $this->videoFrameSplitter                = $videoFrameSplitter;
        $this->videoFacade                       = $videoFacade;
        $this->labelingTaskFacade                = $labelingTaskFacade;
        $this->projectFacade                     = $projectFacade;
        $this->fileSystem                        = $fileSystem;
        $this->cacheDir                          = $cacheDir;
        $this->videoCdnService                   = $videoCdnService;
        $this->couchDbUpdateConflictRetryService = $couchDbUpdateConflictRetryService;
        $this->amqpFacade                        = $amqpFacade;
    }

    /**
     * @param Job                        $job
     * @param Logger\Facade\LoggerFacade $logger
     *
     * @todo throw better exceptions
     */
    protected function runJob(Job $job, \crosscan\Logger\Facade\LoggerFacade $logger)
    {
        try {
            /** @var Model\Video $video */
            /** @var Jobs\VideoFrameSplitter $job */
            $video = $this->videoFacade->find($job->videoId);

            if ($video === null) {
                //Project and related entities can be deleted
                $logger->logString("Video '{$job->videoId}' could not be found", \cscntLogPayload::SEVERITY_WARNING);
                return;
            }

            $frameSizesInBytes = $this->videoFrameSplitter->splitVideoInFrames($video, $video->getSourceVideoPath(), $job->imageType);
            $imageSizes        = $this->videoFrameSplitter->getImageSizes();

            $this->updateDocument(
                $video,
                $job->imageType,
                $imageSizes[1][0],
                $imageSizes[1][1],
                array_sum($frameSizesInBytes),
                0,
                1,
                $logger
            );

            $tasks = $this->labelingTaskFacade->findByVideoIds([$video->getId()]);

            $projectIds = [];
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
            foreach (array_unique($projectIds) as $projectId) {
                $job = new Jobs\CalculateProjectDiskSize($projectId);
                $this->amqpFacade->addJob($job, WorkerPool\Facade::LOW_PRIO);
            }
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
            $this->setFailure($job);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
            $this->setFailure($job);
        }
    }

    /**
     * @param Job $job
     */
    private function setFailure(Job $job)
    {
        if ($video = $this->videoFacade->find($job->videoId)) {
            $video->setImageType($job->imageType->getName(), 'converted', false);
            $video->setImageType($job->imageType->getName(), 'failed', true);
            $this->videoFacade->save($video);
        }

        $tasks = $this->labelingTaskFacade->findByVideoIds([$job->videoId]);
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
        $maxRetries = 1,
        \crosscan\Logger\Facade\LoggerFacade $logger
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
            $this->updateDocument($video, $imageType, $retryCount + 1, $width, $height, $frameSizesInBytes, 1, $logger);
        } catch (CouchDB\DocumentNotFoundException $notFoundException) {
            $logger->logString(sprintf('Video not found. Id: %s ', $video->getId()), \cscntLogPayload::SEVERITY_WARNING);
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
