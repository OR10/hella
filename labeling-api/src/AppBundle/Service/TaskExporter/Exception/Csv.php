<?php

namespace AppBundle\Service\TaskExporter\Exception;

use AppBundle\Exception;

class Csv extends Exception
{
    /**
     * @param string $message
     */
    public function __construct($message = null)
    {
        parent::__construct($message);
    }
}
