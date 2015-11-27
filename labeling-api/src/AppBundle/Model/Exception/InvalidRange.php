<?php

namespace AppBundle\Model\Exception;

class InvalidRange extends FrameRange
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
