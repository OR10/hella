<?php
class cscntLogUniqueNameRequiredException extends Exception 
{
    public function __construct() 
    {
        parent::__construct( "A unique name to identify the given resource is required." );
    }
}
