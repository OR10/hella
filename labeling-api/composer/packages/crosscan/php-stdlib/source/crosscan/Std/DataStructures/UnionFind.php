<?php

namespace crosscan\Std\DataStructures;

/**
 * Facade of an union-find data-structure with strings identifying the elements.
 */
interface UnionFind
{

    /**
     * Return the set an element belongs to.  By definition each element belongs to some set.  So this method returns
     * always a valid set even if this implies that a set of size one is returned.
     *
     * @param string $element
     *
     * @return UnionFind\Set
     */
    public function find($element);

    /**
     * @param UnionFind\Set $set1
     * @param UnionFind\Set $set2
     */
    public function union(UnionFind\Set $set1, UnionFind\Set $set2);

    /**
     * @param string $element1
     * @param string $element2
     */
    public function unionByElements($element1, $element2);

}
