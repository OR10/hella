<?php

namespace AppBundle\Model\Video\ImageType;

class Source extends Base
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
    protected $name = 'source';

    /**
     * String with a additional command parameters
     *
     * @var string
     */
    protected $commandParameters = '-f image2';
}
