<?php
class cscntLoggerInstanceNotAvailableException extends Exception 
{
    public function __construct() 
    {
        parent::__construct( 
            "A Logger instance has been requested, while no one was stored." 
        );
    }
}
