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
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * Video constructor.
     *
     * @param VideoService\VideoFrameSplitter $videoFrameSplitter
     * @param Facade\Video                    $videoFacade
     * @param Facade\LabelingTask             $labelingTaskFacade
     * @param Facade\Project                  $projectFacade
     * @param Flysystem\Filesystem            $fileSystem
     * @param Service\VideoCdn                $videoCdnService
     * @param string                          $cacheDir
     */
    public function __construct(
        VideoService\VideoFrameSplitter $videoFrameSplitter,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade,
        Flysystem\Filesystem $fileSystem,
        Service\VideoCdn $videoCdnService,
        $cacheDir
    ) {
        $this->videoFrameSplitter = $videoFrameSplitter;
        $this->videoFacade        = $videoFacade;
        $this->labelingTaskFacade = $labelingTaskFacade;
        $this->projectFacade      = $projectFacade;
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

        try {
            /** @var Model\Video $video */
            /** @var Jobs\VideoFrameSplitter $job */
            $video = $this->videoFacade->find($job->videoId);

            if ($video === null) {
                throw new \RuntimeException("Video '{$job->videoId}' could not be found");
            }

            $tmpFile = $this->createTemporaryFileForVideo($video);

            if (file_put_contents($tmpFile, $this->videoCdnService->getVideo($video)) === false) {
                throw new \RuntimeException("Error writing video data to temporary file '{$tmpFile}'");
            }

            $frameSizesInBytes = $this->videoFrameSplitter->splitVideoInFrames($video, $tmpFile, $job->imageType);
            $imageSizes        = $this->videoFrameSplitter->getImageSizes();

            $this->updateDocument($video, $job->imageType, $imageSizes[1][0], $imageSizes[1][1], $frameSizesInBytes);

            $tasks = $this->labelingTaskFacade->findByVideoIds([$video->getId()]);

            $projectIds = [];
            foreach ($tasks as $task) {
                $projectIds[] = $task->getProjectId();
                $task->setStatusIfAllImagesAreConverted($video);
                $this->labelingTaskFacade->save($task);
            }
            foreach (array_unique($projectIds) as $projectId) {
                $project = $this->projectFacade->find($projectId);
                $this->updateProject($project, $project->getDiskUsageInBytes() + array_sum($frameSizesInBytes));
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

    /**
     * @param Model\Project $project
     * @param               $diskUsage
     * @param int           $retryCount
     * @param int           $maxRetries
     *
     * @throws CouchDB\UpdateConflictException
     */
    private function updateProject(Model\Project $project, $diskUsage, $retryCount = 0, $maxRetries = 1)
    {
        try {
            $this->projectFacade->refresh($project);
            $project->setDiskUsageInBytes($diskUsage);
            $this->projectFacade->update();
        } catch (CouchDB\UpdateConflictException $updateConflictException) {
            if ($retryCount > $maxRetries) {
                throw $updateConflictException;
            }
            $this->updateProject($project, $diskUsage, $retryCount + 1);
        }
    }

    /**
     * @param Job $job
     */
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
     * Create a temporary file and return its filepath for the given video
     *
     * The temporary file will have the same file extension as the original video.
     *
     * @param Model\Video $video
     *
     * @return string
     */
    private function createTemporaryFileForVideo(Model\Video $video)
    {
        $videoFileExtension = \pathinfo($video->getName(), PATHINFO_EXTENSION);

        $tmpFile = null;
        do {
            $tmpFile = $this->cacheDir
                . '/'
                . 'source_video_'
                . \hash('sha256', \openssl_random_pseudo_bytes(256 / 8))
                . '.'
                . $videoFileExtension;
        } while (\file_exists($tmpFile));

        if (\touch($tmpFile) === false) {
            throw new \RuntimeException('Error creating temporary file for video data');
        };

        return $tmpFile;
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
