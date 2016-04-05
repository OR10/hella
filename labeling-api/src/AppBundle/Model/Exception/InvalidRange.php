<?php

namespace AppBundle\Model\Exception;

class InvalidRange extends FrameRange
{
    public $startFrameIndex;
    public $endFrameIndex;

    public function __construct($startFrameIndex, $endFrameIndex)
    {
        parent::__construct("Invalid range: {$startFrameIndex} - {$endFrameIndex}");

        $this->startFrameIndex = $startFrameIndex;
        $this->endFrameIndex   = $endFrameIndex;
    }
}
