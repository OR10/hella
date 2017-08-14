<?php

namespace crosscan\Tests\Std\ImageMetadata;

/**
 * crosscan connect ImageMetadata testsuite
 */
class Suite extends \PHPUnit_Framework_TestSuite
{
    public function __construct()
    {
        parent::__construct();

        $this->setName( 'ImageMetadata' );
        $this->addTest( ImageMetadataTest::suite() );
        $this->addTest( GdMemoryTest::suite() );
        $this->addTest( SvgMemoryTest::suite() );
    }

    public static function suite()
    {
        return new self( __CLASS__ );
    }
}
