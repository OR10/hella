<?php
class cscntLoggerFacilityFilterTests extends PHPUnit_Framework_TestCase
{
    protected function payloadFixture( $facility ) 
    {
        return $this->getMockForAbstractClass( 
            'cscntLogPayload',
            array( cscntLogPayload::SEVERITY_INFO, $facility, "BarId" )
        );
    }

    public function testWritersArePassedThrough() 
    {
        $payload = $this->payloadFixture( "FooFacility" );
        $filter = new cscntLogFacilityFilter(
            "FooFacility",
            array( "foo", "bar", "baz" )
        );

        $storage = $filter->route( $payload );
        $this->assertEquals(
            array( "foo", "bar", "baz" ),
            $storage[$payload]
        );
    }

    public function testMatchingFacility()
    {
        $payload = $this->payloadFixture( "Some facility" );
        $filter = new cscntLogFacilityFilter(
            "Some facility",
            array( "foo" )
        );

        $storage = $filter->route( $payload );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload]
        );
    }

    public function testMismatchingFacility()
    {
        $payload = $this->payloadFixture( "Some facility" );
        $filter = new cscntLogFacilityFilter(
            "Some other facility",
            array( "foo" )
        );

        $storage = $filter->route( $payload );
        $this->assertEquals(
            0,
            $storage->count()
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}

