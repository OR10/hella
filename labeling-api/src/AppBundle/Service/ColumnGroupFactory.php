<?php

namespace AppBundle\Service;

use AppBundle\Helper\Export\ColumnGroup;

class ColumnGroupFactory
{
    const PLAIN = ColumnGroup\Plain::class;
    const UNIQUE = ColumnGroup\Unique::class;

    public function __construct()
    {
    }

    /**
     * @param string $type
     *
     * @return ColumnGroup
     */
    public function create($type = self::PLAIN)
    {
        return new $type();
    }
}