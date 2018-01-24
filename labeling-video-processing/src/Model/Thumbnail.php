<?php

namespace Model;

class Thumbnail extends ImageType
{
    /**
     * File type extension
     *
     * @var string $extension
     */
    protected $extension = 'jpg';

    /**
     * File type name
     *
     * @var string
     */
    protected $name = 'thumbnail';

    /**
     * String with a additional command parameters
     *
     * @var string
     */
    protected $commandParameters = '-f image2 -qscale:v 3 -vf scale=200:-1';
}
