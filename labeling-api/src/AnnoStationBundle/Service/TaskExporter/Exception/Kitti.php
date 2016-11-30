<?php

namespace AnnoStationBundle\Service\TaskExporter\Exception;

use AppBundle\Exception;

class Kitti extends Exception
{
    /**
     * @var integer
     */
    private $frameNumber;

    /**
     * @param string    $message
     * @param int       $frameIndex
     * @param Exception $previousException
     */
    public function __construct($message = null, $frameIndex = null, \Exception $previousException = null)
    {
        $this->frameNumber = (int) $frameIndex;

        if ($this->frameNumber !== null) {
            $message .= sprintf(', frameNumber: %d', $this->frameNumber);
        }
        parent::__construct($message, 0, $previousException);
    }

    public function getFrameNumber()
    {
        return $this->frameNumber;
    }
}
