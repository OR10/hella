<?php

namespace AppBundle\Service\Video\Exception;

use AppBundle\Exception;

class UnknownDuration extends Exception
{
    public function __construct()
    {
        parent::__construct("Unknown duration!");
    }
}
