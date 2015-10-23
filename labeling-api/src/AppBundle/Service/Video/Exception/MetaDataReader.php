<?php

namespace AppBundle\Service\Video\Exception;

use AppBundle\Exception;

class MetaDataReader extends Exception
{
    public function __construct($message = null)
    {
        $fullMessage = 'Error reading meta data';
        if (!is_null($message)) {
            $fullMessage .= ": {$message}";
        }
        parent::__construct($fullMessage);
    }
}
