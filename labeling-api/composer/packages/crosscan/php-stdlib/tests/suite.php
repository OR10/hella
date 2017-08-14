<?php

namespace crosscan\Tests\Std;

/**
 * crosscan connect Utils testsuite
 */
class Suite extends \PHPUnit_Framework_TestSuite
{
    public function __construct()
    {
        parent::__construct();

        $this->setName( 'Standard Lib' );
        $this->addTestSuite(ImageMetadata\Suite::suite() );
        $this->addTestSuite(ClassUtilsTest::suite());
        $this->addTestSuite(ArrayFunctionsTest::suite());
        $this->addTestSuite(UUIDTest::suite());
    }

    public static function suite()
    {
        return new self( __CLASS__ );
    }
}
