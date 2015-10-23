<?php

namespace AppBundle\Service\Video\Exception;

use AppBundle\Exception;

class UnknownNumberOfFrames extends Exception
{
    public function __construct()
    {
        parent::__construct("Unknown number of frames!");
    }
}
