<?php

namespace Model;

class SourceJpg extends ImageType
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
    protected $name = 'sourceJpg';

    /**
     * String with a additional command parameters
     *
     * @var string
     */
    protected $commandParameters = '-f image2 -qscale:v 2';
}
