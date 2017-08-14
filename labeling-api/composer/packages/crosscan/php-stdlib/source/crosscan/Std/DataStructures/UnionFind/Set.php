<?php

namespace crosscan\Std\DataStructures\UnionFind;

use crosscan\Std\DataStructures;

/**
 * Objects of this class represent an immutable set of an union-find data-structure.  If you manipulate the
 * data-structure the immutable object might no longer be valid.
 */
class Set
{

    /**
     * @var DataStructures\UnionFind
     */
    private $master;

    /**
     * @var int
     */
    private $uniqueId;

    /**
     * @var string[]
     */
    private $elements;

    /**
     * Set constructor.
     *
     * @param DataStructures\UnionFind $master
     * @param int                      $uniqueId
     * @param string[]                 $elements
     */
    public function __construct(DataStructures\UnionFind $master, $uniqueId, array $elements)
    {
        $this->master   = $master;
        $this->uniqueId = $uniqueId;
        $this->elements = $elements;
    }

    /**
     * @return DataStructure\UnionFind
     */
    public function getMaster()
    {
        return $this->master;
    }

    /**
     * @return int
     */
    public function getUniqueId()
    {
        return $this->uniqueId;
    }

    /**
     * @return \string[]
     */
    public function getElements()
    {
        return $this->elements;
    }

}
