<?php

namespace AppBundle\Model;

/**
 * TODO: Find a way to make this an abstract base class.
 *       This is currently not possible because doctrine requires the mapping
 *       annotions in the subclasses (or I am too dumb to do it the right way).
 */
interface Status
{
    public function getId();

    public function getRev();
}
