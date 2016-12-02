<?php

namespace AnnoStationBundle\Service\Exporter\Exception;

use AppBundle\Exception;

class TaskIncomplete extends Exception
{
    /**
     * @param string $message
     */
    public function __construct(string $message = null)
    {
        parent::__construct($message);
    }
}
