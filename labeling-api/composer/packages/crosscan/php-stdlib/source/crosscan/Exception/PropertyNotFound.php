<?php

namespace crosscan\Exception;

/**
 * Exception thrown if a non existing property is accessed on the optional given
 * class.
 */
class PropertyNotFound extends \Exception
{
    public $property;
    public $class;

    public function __construct( $property, $class = null )
    {
        $this->property = $property;
        $this->class    = $class;

        parent::__construct(
            sprintf(
                'No such property with name %s.',
                $property
            )
        );
    }
}
