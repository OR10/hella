<?php

namespace crosscan\Tests\Std\DataStructures;

use crosscan\Std\DataStructures\UnionFind;

class UnionFindTest extends \PHPUnit_Framework_TestCase
{

    /**
     * @dataProvider unionFindSequenceProvider
     */
    public function testUnionFind($singletons, $insertSequence, $expectedSets)
    {
        $factory   = new UnionFind\Factory();
        $unionFind = $factory->create();

        foreach ($singletons as $singleton) {
            $unionFind->find($singleton);
        }

        foreach ($insertSequence as $insertItem) {
            if (isset($insertItem['useSets']) && $insertItem['useSets']) {
                $unionFind->union($unionFind->find($insertItem['first']), $unionFind->find($insertItem['second']));
            } else {
                $unionFind->unionByElements($insertItem['first'], $insertItem['second']);
            }
        }

        foreach ($expectedSets as $expectedSet) {
            $sortedExpectedSet = sort($expectedSet);

            foreach ($sortedExpectedSet as $element) {
                $sortedSet = sort($unionFind->find($element)->getElements());
                $this->assertEquals($sortedExpectedSet, $sortedSet);
            }
        }
    }

    public function unionFindSequenceProvider()
    {
        return [
            [
                ['a', 'b'],
                [
                    array('first' => 'a', 'second' => 'c'),
                    array('useSets' => true, 'first' => 'c', 'second' => 'd'),
                    array('first' => 'e', 'second' => 'f'),
                ],
                [['a', 'c', 'd'], ['b'], ['e', 'f']],
            ],
            [
                ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
                [
                    array('first' => 'a', 'second' => 'c'),
                    array('useSets' => true, 'first' => 'c', 'second' => 'd'),
                    array('first' => 'e', 'second' => 'f'),
                    array('first' => 'f', 'second' => 'a'),
                ],
                [['a', 'c', 'd', 'e', 'f'], ['b'], ['g'], ['h']],
            ],
        ];
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite(self::class);
    }
}
