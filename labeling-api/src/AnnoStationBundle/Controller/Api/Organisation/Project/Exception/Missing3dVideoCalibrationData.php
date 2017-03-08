<?php

namespace AnnoStationBundle\Controller\Api\Organisation\Project\Exception;

use AppBundle\Exception;

class Missing3dVideoCalibrationData extends Exception
{
    /**
     * @param string $message
     */
    public function __construct($message = null)
    {
        parent::__construct($message);
    }
}
