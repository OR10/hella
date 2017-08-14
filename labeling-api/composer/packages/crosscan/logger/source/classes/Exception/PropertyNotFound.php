<?php

class cscntPropertyNotFoundException extends Exception
{
    public $propertyName;

    public function __construct( $propertyName )
    {
        $this->propertyName = $propertyName;

        parent::__construct(
            sprintf(
                'There is no such property "%s".',
                $propertyName
            )
        );
    }
}