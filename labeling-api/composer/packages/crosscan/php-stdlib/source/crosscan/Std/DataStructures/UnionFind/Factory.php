<?php

namespace crosscan\Std\DataStructures\UnionFind;

use crosscan\Std\DataStructures;

class Factory
{

    /**
     * @return DataStructures\UnionFind
     */
    public function create()
    {
        return new NaiveImplementation();
    }

}
