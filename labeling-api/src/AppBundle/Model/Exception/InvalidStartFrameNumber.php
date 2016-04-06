<?php

namespace AppBundle\Model\Exception;

class InvalidStartFrameNumber extends FrameRange
{
    public $startFrameNumber;

    public function __construct($startFrameNumber)
    {
        parent::__construct("Invalid start frame index: {$startFrameNumber}");

        $this->startFrameNumber = $startFrameNumber;
    }
}
