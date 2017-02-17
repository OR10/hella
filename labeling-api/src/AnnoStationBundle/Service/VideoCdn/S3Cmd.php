<?php

namespace AnnoStationBundle\Service\VideoCdn;

use AnnoStationBundle\Service;
use AppBundle\Model;
use crosscan\Logger\Facade\LoggerFacade;


class S3Cmd extends Service\VideoCdn
{
    /**
     * @var Service\S3Cmd
     */
    private $s3CmdVideoCdn;

    /**
     * @var \cscntLogger
     */
    private $loggerFacade;

    /**
     * FrameCdn constructor.
     *
     * @param Service\S3Cmd $s3CmdVideoCdn
     * @param \cscntLogger  $logger
     */
    public function __construct(Service\S3Cmd $s3CmdVideoCdn, \cscntLogger $logger)
    {
        $this->s3CmdVideoCdn = $s3CmdVideoCdn;
        $this->loggerFacade  = new LoggerFacade($logger, self::class);
    }

    /**
     * @param Model\Video $video
     * @param             $source
     *
     * @return mixed
     */
    public function saveVideo(Model\Video $video, $source)
    {
        $this->s3CmdVideoCdn->uploadFile(
            $source,
            $video->getSourceVideoPath()
        );
    }

    /**
     * @param Model\Video $video
     *
     * @return mixed
     */
    public function getVideo(
        Model\Video $video
    ) {
        return $this->s3CmdVideoCdn->getFile($video->getSourceVideoPath());
    }

    /**
     * @param Model\Video $video
     *
     * @return mixed|void
     */
    public function deleteVideoDirectory(Model\Video $video)
    {
        try {
            $sourcePath = sprintf('%s/source', $video->getId());
            $this->s3CmdVideoCdn->deleteObject($sourcePath);
        } catch (\Exception $exception) {
            $this->loggerFacade->logString(
                sprintf(
                    'Failed to delete source video %s file from video-cdn',
                    $video->getId()
                ),
                \cscntLogPayload::SEVERITY_WARNING
            );
        }

        try {
            $videoPath = sprintf('%s/', $video->getId());
            $this->s3CmdVideoCdn->deleteObject($videoPath);
        } catch (\Exception $exception) {
            $this->loggerFacade->logString(
                sprintf(
                    'Failed to delete video directory %s from video-cdn',
                    $video->getId()

                ),
                \cscntLogPayload::SEVERITY_WARNING
            );
        }
    }
}
