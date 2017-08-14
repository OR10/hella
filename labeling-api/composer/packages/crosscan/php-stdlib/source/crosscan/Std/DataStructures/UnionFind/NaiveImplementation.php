<?php

namespace crosscan\Std\DataStructures\UnionFind;

use crosscan\Std\DataStructures;
use crosscan\Std\DataStructures\UnionFind;

class NaiveImplementation implements DataStructures\UnionFind
{

    private $nextUniqueId = 0;

    private $elementsToSetMap = array();

    public function find($element)
    {
        if (!isset($this->elementsToSetMap[$element])) {
            $this->elementsToSetMap[$element] = $this->createNewSet([$element]);
        }

        return $this->elementsToSetMap[$element];
    }

    public function union(UnionFind\Set $set1, UnionFind\Set $set2)
    {
        if ($set1->getMaster() !== $this || $set2->getMaster() !== $this) {
            throw new \Exception("you are stupid!");
        }

        if ($set1->getUniqueId() !== $set2->getUniqueId()) {
            $elements = array_merge($set1->getElements(), $set2->getElements());
            $set      = $this->createNewSet($elements);
            foreach ($elements as $element) {
                $this->elementsToSetMap[$element] = $set;
            }
        }
    }

    public function unionByElements($element1, $element2)
    {
        $this->union($this->find($element1), $this->find($element2));
    }

    private function createNewSet(array $elements)
    {
        $set = new UnionFind\Set($this, $this->nextUniqueId, $elements);
        $this->nextUniqueId++;

        return $set;
    }

}
