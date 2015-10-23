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

        $metaData->format = $this->extractFormat($json);
        $metaData->sizeInBytes = $this->extractSizeInBytes($json);
        $metaData->width = $this->extractWidth($json);
        $metaData->height = $this->extractHeight($json);
        $metaData->duration = $this->extractDuration($json);
        $metaData->numberOfFrames = $this->extractNumberOfFrames($json);
        $metaData->raw = $json;

        return $metaData;
    }

    /**
     * @param string $sourceFileFilename
     */
    private function getCommand($sourceFileFilename)
    {
        return sprintf(
            "%s -show_format -show_streams -of json -v quiet %s",
            $this->ffprobeExecutable,
            $sourceFileFilename
        );
    }

    private function extractFormat(array $json)
    {
        if (isset($json['format']['format_name'])) {
            return $json['format']['format_name'];
        }
        return null;
    }

    private function extractSizeInBytes(array $json)
    {
        if (isset($json['format']['size'])) {
            return $json['format']['size'];
        }
        return null;
    }

    private function extractWidth(array $json)
    {
        if (isset($json['streams'][0]['width'])) {
            return (int) $json['streams'][0]['width'];
        }
        return null;
    }

    private function extractHeight(array $json)
    {
        if (isset($json['streams'][0]['height'])) {
            return (int) $json['streams'][0]['height'];
        }
        return null;
    }

    private function extractNumberOfFrames(array $json)
    {
        if (isset($json['streams'][0]['nb_frames'])) {
            return (int) $json['streams'][0]['nb_frames'];
        }

        throw new Exception\UnknownNumberOfFrames();
    }

    private function extractDuration(array $json)
    {
        if (isset($json['streams'][0]['duration'])) {
            return (float) $json['streams'][0]['duration'];
        }

        throw new Exception\UnknownDuration();
    }
}
