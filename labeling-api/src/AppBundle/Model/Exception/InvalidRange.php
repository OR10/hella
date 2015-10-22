<?php

namespace AppBundle\Model\Exception;

use AppBundle\Exception;

class InvalidRange extends Exception
{
    public $startFrameNumber;
    public $endFrameNumber;

    public function __construct($startFrameNumber, $endFrameNumber)
    {
        parent::__construct("Invalid range: {$startFrameNumber} - {$endFrameNumber}");

        $this->startFrameNumber = $startFrameNumber;
        $this->endFrameNumber   = $endFrameNumber;
    }
}
