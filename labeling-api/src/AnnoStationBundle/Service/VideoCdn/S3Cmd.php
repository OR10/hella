<?php

namespace AnnoStationBundle\Service\VideoCdn;

use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use League\Flysystem\Adapter;
use League\Flysystem\Filesystem;

class S3Cmd extends Service\VideoCdn
{
    /**
     * @var Service\S3Cmd
     */
    private $s3CmdVideoCdn;

    /**
     * FrameCdn constructor.
     *
     * @param Service\S3Cmd $s3CmdVideoCdn
     */
    public function __construct(Service\S3Cmd $s3CmdVideoCdn)
    {
        $this->s3CmdVideoCdn = $s3CmdVideoCdn;
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
}
