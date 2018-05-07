<?php

namespace Model;


class ThumbnailPng extends ImageType
{
    /**
     * File type extension
     *
     * @var string $extension
     */
    protected $extension = 'png';

    /**
     * File type name
     *
     * @var string
     */
    protected $name = 'thumbnailPng';

    /**
     * String with a additional command parameters
     *
     * @var string
     */
    protected $commandParameters = '-f image2';
}
