<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Exception;
use crosscan\WorkerPool\Job;
use AppBundle\Service\Video as VideoService;
use AppBundle\Worker\Jobs;
use AppBundle\Database\Facade;
use AppBundle\Model;
use League\Flysystem;
use Doctrine\ODM\CouchDB;
use AppBundle\Model\Video\ImageType;
use AppBundle\Service;

class VideoFrameSplitter extends WorkerPool\JobInstruction
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
     * @var Service\FrameCdn
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
    public function run(Job $job, \crosscan\Logger\Facade\LoggerFacade $logger)
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

            $this->videoFrameSplitter->splitVideoInFrames($video, $tmpFile, $job->imageType);
            $imageSizes = $this->videoFrameSplitter->getImageSizes();

            $this->updateDocument($video, $job->imageType, $imageSizes[1][0], $imageSizes[1][1]);

            $disabledTasks = $this->labelingTaskFacade->findAllByStatus(
                $video,
                Model\LabelingTask::STATUS_PREPROCESSING
            );
            foreach ($disabledTasks as $disabledTask) {
                $disabledTask->setStatusIfAllImagesAreConverted($video);
                $this->labelingTaskFacade->save($disabledTask);
            }
        } catch (\Exception $exception) {
            $logger->logException($exception, \cscntLogPayload::SEVERITY_FATAL);
        } catch (\Throwable $throwable) {
            $logger->logString((string) $throwable, \cscntLogPayload::SEVERITY_FATAL);
        } finally {
            if (!unlink($tmpFile)) {
                throw new \RuntimeException("Error removing temporary file '{$tmpFile}'");
            }
        }
    }

    /**
     * @param Model\Video    $video
     * @param ImageType\Base $imageType
     * @param                $width
     * @param                $height
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
        $retryCount = 0,
        $maxRetries = 1
    ) {
        $imageTypeName = $imageType->getName();
        try {
            $this->videoFacade->refresh($video);
            $video->setImageType($imageTypeName, 'converted', true);
            $video->setImageType($imageTypeName, 'width', $width);
            $video->setImageType($imageTypeName, 'height', $height);
            $this->videoFacade->update();
        } catch (CouchDB\UpdateConflictException $updateConflictException) {
            if ($retryCount > $maxRetries) {
                throw $updateConflictException;
            }
            $this->updateDocument($video, $retryCount + 1, $width, $height);
        }
    }
}
