<?php

namespace crosscan\Exception;

/**
 * Exception thrown if a property is accessed in a way which is restricted by
 * permission. For example if an id property which is read-only is accessed for
 * read.
 * This class is adapted from the same ezcBasePropertyPermissionException.
 */
class PropertyPermission extends \Exception
{
    /**
     * Used when property is read-only
     */
    const READ  = 1;
    /**
     * Used when property is write-only
     */
    const WRITE = 2;

    public $name;
    public $mode;

    /**
     * Constructs a new instance of this exception
     *
     * @param string $name name of the accessed property.
     * @param int $mode mode the property was accessed with (one of ::READ or
     * ::WRITE).
     */
    public function __construct( $name, $mode )
    {
        $this->name = $name;
        $this->mode = $mode;

        parent::__construct(
            sprintf(
                'Tried to access %s-only property "%s"',
                ( $mode === self::READ ) ? 'read' : 'write',
                $name
            )
        );
    }
}
