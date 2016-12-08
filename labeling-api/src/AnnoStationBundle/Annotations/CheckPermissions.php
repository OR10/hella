<?php

namespace AnnoStationBundle\Annotations;

/**
 * @Annotation
 * @Target({"METHOD"})
 */
class CheckPermissions
{
    /**
     * @var array
     */
    private $permissions = [];

    /**
     * @param $options
     */
    public function __construct($options)
    {
        if (isset($options['value'])) {
            $this->permissions = $options['value'];
        }
    }

    /**
     * @return string
     */
    public function getPermissions()
    {
        return $this->permissions;
    }
}
