<?php

namespace AppBundle\Model\TaskExport\Exception;

use AppBundle\Exception;

class EmptyData extends Exception
{
    public function __construct()
    {
        parent::__construct('Empty export data');
    }
}
