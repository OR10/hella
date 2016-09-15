<?php

namespace AppBundle\Service\Exporter\Exception;

use AppBundle\Exception;

class LegacyProjectToCsv extends Exception
{
    /**
     * @param string $message
     */
    public function __construct(string $message = null)
    {
        parent::__construct($message);
    }
}
