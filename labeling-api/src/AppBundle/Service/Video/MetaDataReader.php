<?php

namespace AppBundle\Service\Video;

use AppBundle\Model;
use Symfony\Component\Process;

class MetaDataReader
{
    /**
     * @var string
     */
    private $ffprobeExecutable;

    /**
     * @param string $ffprobeExecutable
     */
    public function __construct($ffprobeExecutable)
    {
        $this->ffprobeExecutable = $ffprobeExecutable;
    }

    /**
     * Read and set the meta data for the given video.
     *
     * @param Model\Video\MetaData $video
     */
    public function readMetaData($filename)
    {
        $process = new Process\Process($this->getCommand($filename));
        $process->setTimeout(10);
        $process->run();

        $json = json_decode($process->getOutput(), true);

        $metaData = new Model\Video\MetaData();

        $metaData->format = $json['format']['format_name'];
        $metaData->sizeInBytes = $json['format']['size'];
        $metaData->width = $json['streams'][0]['width'];
        $metaData->height = $json['streams'][0]['height'];
        $metaData->duration = $json['streams'][0]['duration'];
        $metaData->raw = $json;

        return $metaData;
    }

    /**
     * @param string $sourceFileFilename
     */
    public function getCommand($sourceFileFilename)
    {
        return sprintf(
            "%s -show_format -show_streams -of json -v quiet %s",
            $this->ffprobeExecutable,
            $sourceFileFilename
        );
    }
}
