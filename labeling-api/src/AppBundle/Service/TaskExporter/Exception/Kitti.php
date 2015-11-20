<?php

namespace AppBundle\Service\TaskExporter\Exception;

use AppBundle\Exception;

class Kitti extends Exception
{
    /**
     * @var integer
     */
    private $frameNumber;

    public function __construct($message = null, $code = 0, \Exception $previousException = null)
    {
        parent::__construct($message, $code, $previousException);
    }

    public function getFrameNumber()
    {
        return $this->frameNumber;
    }

    public function setFrameNumber($frameNumber)
    {
        $this->frameNumber = (int) $frameNumber;
    }

    public function getMessage()
    {
        $message = parent::getMessage();

        if ($this->frameNumber === null) {
            $message .= sprintf(', frameNumber: %d', $this->frameNumber);
        }

        return $message;
    }
}
