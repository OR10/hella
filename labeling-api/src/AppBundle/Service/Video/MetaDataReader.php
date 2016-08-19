<?php

namespace AppBundle\Service\Video;

use AppBundle\Model;
use Symfony\Component\Process;

class MetaDataReader
{
    const COMMANDLINE = '%s -show_format -show_streams -of json -v quiet "%s"';

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

        $videoStreamData = $this->getFirstVideoStream($json);

        $metaData->raw            = $json;
        $metaData->format         = $this->getArrayKey($json['format'], 'format_name');
        $metaData->sizeInBytes    = $this->getArrayKey($json['format'], 'size');
        $metaData->width          = $this->getArrayKey($videoStreamData, 'width');
        $metaData->height         = $this->getArrayKey($videoStreamData, 'height');
        $metaData->duration       = $this->getArrayKey($videoStreamData, 'duration');
        $metaData->numberOfFrames = $this->getArrayKey($videoStreamData, 'nb_frames');

        $metaData->fps = (int) $metaData->numberOfFrames / $metaData->duration;

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

    private function getFirstVideoStream(array $json)
    {
        foreach ($json['streams'] as $stream) {
            if ($stream['codec_type'] === 'video') {
                return $stream;
            }
        }

        throw new Exception\MetaDataReader('no video stream found');
    }

    private function getArrayKey(array $array, $key)
    {
        if (isset($array[$key])) {
            return $array[$key];
        }

        throw new Exception\MetaDataReader("Key {$key} does not exist");
    }
}
