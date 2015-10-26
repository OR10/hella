<?php

namespace AppBundle\Service\Video;

use AppBundle\Model;
use Symfony\Component\Process;

class MetaDataReader
{
    const COMMANDLINE = '%s -show_format -show_streams -of json -v quiet %s';

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
        $json = json_decode($this->runCommand($this->getCommand($filename)), true);

        if (is_null($json)) {
            throw new Exception\MetaDataReader('invalid json');
        }

        $metaData = new Model\Video\MetaData();

        $metaData->format         = $this->extractFormat($json);
        $metaData->sizeInBytes    = $this->extractSizeInBytes($json);
        $metaData->width          = $this->extractWidth($json);
        $metaData->height         = $this->extractHeight($json);
        $metaData->duration       = $this->extractDuration($json);
        $metaData->numberOfFrames = $this->extractNumberOfFrames($json);
        $metaData->raw            = $json;

        return $metaData;
    }

    /**
     * @param string $commandline
     */
    protected function runCommand($commandline)
    {
        $process = new Process\Process($commandline);
        $process->setTimeout(10);
        $process->mustRun();

        return $process->getOutput();
    }

    /**
     * @param string $sourceFileFilename
     */
    private function getCommand($sourceFileFilename)
    {
        return sprintf(self::COMMANDLINE, $this->ffprobeExecutable, $sourceFileFilename);
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

        throw new Exception\MetaDataReader('reading size in bytes');
    }

    private function extractWidth(array $json)
    {
        if (isset($json['streams'][0]['width'])) {
            return (int) $json['streams'][0]['width'];
        }

        throw new Exception\MetaDataReader('reading width');
    }

    private function extractHeight(array $json)
    {
        if (isset($json['streams'][0]['height'])) {
            return (int) $json['streams'][0]['height'];
        }

        throw new Exception\MetaDataReader('reading height');
    }

    private function extractNumberOfFrames(array $json)
    {
        if (isset($json['streams'][0]['nb_frames'])) {
            return (int) $json['streams'][0]['nb_frames'];
        }

        throw new Exception\MetaDataReader('number of frames');
    }

    private function extractDuration(array $json)
    {
        if (isset($json['streams'][0]['duration'])) {
            return (float) $json['streams'][0]['duration'];
        }

        throw new Exception\MetaDataReader('duration');
    }
}
