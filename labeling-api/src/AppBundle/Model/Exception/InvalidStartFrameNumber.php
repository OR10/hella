<?php

namespace AppBundle\Model\Exception;

use AppBundle\Exception;

class InvalidStartFrameNumber extends Exception
{
    public $startFrameNumber;

    public function __construct($startFrameNumber)
    {
        parent::__construct("Invalid start frame number: {$startFrameNumber}");

        $this->startFrameNumber = $startFrameNumber;
    }
}
