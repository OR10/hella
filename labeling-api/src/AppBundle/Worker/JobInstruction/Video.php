<?php
namespace AppBundle\Worker\JobInstruction;

use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\Exception;
use crosscan\WorkerPool\Job;
use AppBundle\Service\Video as VideoService;
use AppBundle\Database\Facade;
use AppBundle\Model;
use League\Flysystem;

class Video extends WorkerPool\JobInstruction
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
     * @var Flysystem\FileSystem
     */
    private $fileSystem;

    /**
     * @var string
     */
    private $cacheDir;

    /**
     * Video constructor.
     * @param VideoService\VideoFrameSplitter $videoFrameSplitter
     * @param Facade\Video                    $videoFacade
     * @param Flysystem\FileSystem            $fileSystem
     * @param string                          $cacheDir
     */
    public function __construct(
        VideoService\VideoFrameSplitter $videoFrameSplitter,
        Facade\Video $videoFacade,
        Flysystem\FileSystem $fileSystem,
        $cacheDir
    )
    {
        $this->videoFrameSplitter = $videoFrameSplitter;
        $this->videoFacade        = $videoFacade;
        $this->fileSystem         = $fileSystem;
        $this->cacheDir           = $cacheDir;
    }


    public function run(Job $job, \crosscan\Logger\Facade\LoggerFacade $logger)
    {
        /** @var Model\Video $video */
        $video = $this->videoFacade->find($job->videoId);

        $tmpFile = tempnam($this->cacheDir, 'source_video');

        file_put_contents(
            $tmpFile,
            $this->fileSystem->read($video->getSourceVideoPath()
            )
        );

        $this->videoFrameSplitter->splitVideoInFrames($video, $tmpFile, $job->imageType);
        $this->videoFacade->refresh($video);
        $video->setImageTypeConvertedStatus($job->imageType->getName(), true);
        $this->videoFacade->update();

        unlink($tmpFile);
    }
}