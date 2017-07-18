<?php

namespace AnnoStationBundle\Service\Video;

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
     * @param string $filename
     *
     * @return Model\Video\MetaData
     *
     * @throws Exception\MetaDataReader
     */
    public function readMetaData(string $filename): Model\Video\MetaData
    {
        $json = json_decode($this->runCommand($this->getCommand($filename)), true);

        if (is_null($json)) {
            throw new Exception\MetaDataReader('invalid json');
        }

        $metaData = new Model\Video\MetaData();

        $videoStreamData = $this->getFirstVideoStream($json);

        $metaData->raw         = $json;
        $metaData->format      = $this->getArrayKey($json['format'], 'format_name');
        $metaData->width       = $this->getArrayKey($videoStreamData, 'width');
        $metaData->height      = $this->getArrayKey($videoStreamData, 'height');
        $metaData->duration    = $this->getArrayKey($videoStreamData, 'duration');

        // Single images do not always provide a filesize in the `ffprobe` result.
        // Therefore we simple query the filesystem directly.
        $metaData->sizeInBytes = filesize($filename);

        // Single frame formats (like images) do not have a frame count set.
        try {
            $metaData->numberOfFrames = $this->getArrayKey($videoStreamData, 'nb_frames');
        } catch(Exception\MetaDataReader $e) {
            $metaData->numberOfFrames = 1;
        }

        $metaData->fps = (int) $metaData->numberOfFrames / $metaData->duration;

        return $metaData;
    }

    /**
     * @param string $commandline
     *
     * @return string
     */
    protected function runCommand(string $commandline): string
    {
        $process = new Process\Process($commandline);
        $process->setTimeout(10);
        $process->mustRun();

        return $process->getOutput();
    }

    /**
     * @param string $sourceFileFilename
     *
     * @return string
     */
    private function getCommand(string $sourceFileFilename): string
    {
        return sprintf(self::COMMANDLINE, $this->ffprobeExecutable, $sourceFileFilename);
    }

    /**
     * @param array $json
     *
     * @return array
     * @throws Exception\MetaDataReader
     */
    private function getFirstVideoStream(array $json): array
    {
        foreach ($json['streams'] as $stream) {
            if ($stream['codec_type'] === 'video') {
                return $stream;
            }
        }

        throw new Exception\MetaDataReader('no video stream found');
    }

    /**
     * @param array  $array
     * @param string $key
     *
     * @return mixed
     * @throws Exception\MetaDataReader
     */
    private function getArrayKey(array $array, string $key)
    {
        if (isset($array[$key])) {
            return $array[$key];
        }

        throw new Exception\MetaDataReader("Key {$key} does not exist");
    }
}
