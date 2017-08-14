<?php

namespace crosscan\Tests\Std\DataStructures;

class Suite extends \PHPUnit_Framework_TestSuite
{
    public function __construct()
    {
        parent::__construct();

        $this->setName( 'Standard Lib: Data-Structures' );
        $this->addTestSuite(UnionFindTest::suite());
    }

    public static function suite()
    {
        return new self(self::class);
    }
}