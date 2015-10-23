<?php

namespace AppBundle\Model\Video;

class MetaData
{
    /**
     * @var string
     */
    public $format;

    /**
     * @var integer
     */
    public $width;

    /**
     * @var integer
     */
    public $height;

    /**
     * @var float
     */
    public $fps;

    /**
     * @var float
     */
    public $duration;

    /**
     * @var integer
     */
    public $sizeInBytes;

    /**
     * @var integer
     */
    public $frames;

    /**
     * Holds the raw meta data which was extracted during the import process.
     *
     * @var mixed
     */
    public $raw;
}
