<?php

namespace AppBundle\Model\Exception;

class InvalidStartFrameIndex extends FrameRange
{
    public $startFrameIndex;

    public function __construct($startFrameIndex)
    {
        parent::__construct("Invalid start frame index: {$startFrameIndex}");

        $this->startFrameIndex = $startFrameIndex;
    }
}
