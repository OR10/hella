<?php
class cscntLoggerFacilityGroupFilterTests extends PHPUnit_Framework_TestCase
{
    protected $filter = null;

    public function setUp() 
    {
        $this->filter = new cscntLogFacilityGroupFilter( 
            "some facility",
            array( "foo" )
        );
    }

    protected function payloadFixture( $facility ) 
    {
        return $this->getMockForAbstractClass( 
            'cscntLogPayload',
            array( cscntLogPayload::SEVERITY_WARNING, $facility, "BarId" )
        );
    }

    public function testAtomicGroupPassed()
    {
        $payload = $this->payloadFixture( "some facility" );

        $storage = $this->filter->route( $payload );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload]
        );
    }

    public function testAtomicGroupRejected()
    {
        $payload = $this->payloadFixture( "some other facility" );

        $storage = $this->filter->route( $payload );
        $this->assertEquals(
            0,
            $storage->count()
        );
    }

    public function testMultiGroupWithAtomicMatchPassed()
    {
        $payload1 = $this->payloadFixture( "some facility" );
        $payload2 = $this->payloadFixture( "some facility" );

        $storage = $this->filter->route( $payload1 );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload1]
        );

        $storage = $this->filter->route( $payload2 );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload2]
        );
    }

    public function testMultiGroupWithAtomicMatchRejected()
    {
        $payload1 = $this->payloadFixture( "some other facility" );
        $payload2 = $this->payloadFixture( "some other facility" );

        $storage = $this->filter->route( $payload1 );
        $this->assertEquals(
            0,
            $storage->count()
        );
        $storage = $this->filter->route( $payload2 );
        $this->assertEquals(
            0,
            $storage->count()
        );
    }

    public function testMultiGroupWithSingleMatchPassed()
    {
        $payload1 = $this->payloadFixture( "some facility" );
        $payload2 = $this->payloadFixture( "some other facility" );

        $storage = $this->filter->route( $payload1 );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload1]
        );

        $storage = $this->filter->route( $payload2 );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload2]
        );
    }

    public function testMultiGroupWithSingleMatchPassed2()
    {
        $payload1 = $this->payloadFixture( "some other facility" );
        $payload2 = $this->payloadFixture( "some facility" );

        $storage = $this->filter->route( $payload1 );
        $this->assertEquals(
            0,
            $storage->count()
        );

        $storage = $this->filter->route( $payload2 );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload2]
        );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload1]
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}

