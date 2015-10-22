<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Model\Video\ImageType;
use AppBundle\Database\Facade;
use AppBundle\Service;

class ImporterService
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Service\Video\MetaDataReader
     */
    private $metaDataReader;
    /**
     * @var Service\Video\VideoFrameSplitter
     */
    private $frameCdnSplitter;

    /**
     * ImportVideoCommand constructor.
     *
     * @param Facade\Video                 $videoFacade
     * @param Service\Video\MetaDataReader $metaDataReader
     * @param Video\VideoFrameSplitter     $frameCdnSplitter
     */
    public function __construct(
        Facade\Video $videoFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter
    ) {
        $this->videoFacade      = $videoFacade;
        $this->metaDataReader   = $metaDataReader;
        $this->frameCdnSplitter = $frameCdnSplitter;
    }

    public function import($filename, ImageType\Base $imageType)
    {
        $video = new Model\Video(basename($filename));
        $video->setMetaData($this->metaDataReader->readMetaData($filename));
        $this->videoFacade->save($video, $filename);
        $this->frameCdnSplitter->splitVideoInFrames($video, $filename, $imageType);
    }
}