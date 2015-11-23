<?php

namespace AppBundle\Service\TaskExporter\Exception;

use AppBundle\Exception;

class Kitti extends Exception
{
    /**
     * @var integer
     */
    private $frameNumber;

    /**
     * @param string    $message
     * @param int       $frameNumber
     * @param Exception $previousException
     */
    public function __construct($message = null, $frameNumber = null, \Exception $previousException = null)
    {
        $this->frameNumber = (int) $frameNumber;

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
