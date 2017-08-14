<?php

namespace crosscan\Interfaces;

/**
 * Interface to compare objects
 *
 * Interface EqualityComparable
 */
interface EqualityComparable
{
    /**
     * Compare this object with another one to ensure that both objects are equal.
     *
     * @param mixed $that
     *
     * @return bool
     */
    public function equals($that);
}