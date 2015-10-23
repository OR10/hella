<?php

namespace AppBundle\Service\Video\Exception;

use AppBundle\Exception;

class MetaDataReader extends Exception
{
    public function __construct()
    {
        parent::__construct('Error reading meta data');
    }
}
