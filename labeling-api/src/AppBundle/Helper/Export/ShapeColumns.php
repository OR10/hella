<?php

namespace AppBundle\Helper\Export;

abstract class ShapeColumns
{
    /**
     * Create all necessary columns for the corresponding shape
     *
     * @return Column[]
     */
    abstract public function create();
}
