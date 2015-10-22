<?php

namespace AppBundle\Service\Video;

use AppBundle\Model;

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
        $command = vsprintf(
            "%s -show_format -show_streams -of json -v quiet %s",
            [
                $this->ffprobeExecutable,
                $filename
            ]
        );

        $json = json_decode(shell_exec($command), true);

        dump($json);

        $metaData = new Model\Video\MetaData();

        $metaData->format = $json['format']['format_name'];
        $metaData->sizeInBytes = $json['format']['size'];
        $metaData->width = $json['streams'][0]['width'];
        $metaData->height = $json['streams'][0]['height'];
        $metaData->duration = $json['streams'][0]['duration'];
        $metaData->raw = $json;

        return $metaData;
    }
}
