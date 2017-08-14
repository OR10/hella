<?php
class cscntLoggerSeverityGroupFilterTests extends PHPUnit_Framework_TestCase
{
    protected $filter = null;

    public function setUp() 
    {
        $this->filter = new cscntLogSeverityGroupFilter( 
            cscntLogPayload::SEVERITY_WARNING,
            array( "foo" )
        );
    }

    protected function payloadFixture( $severity ) 
    {
        return $this->getMockForAbstractClass( 
            'cscntLogPayload',
            array( $severity, "FooFacility", "BarId" )
        );
    }

    public function testAtomicGroupPassed()
    {
        $payload = $this->payloadFixture( cscntLogPayload::SEVERITY_WARNING );

        $storage = $this->filter->route( $payload );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload]
        );
    }

    public function testAtomicGroupRejected()
    {
        $payload = $this->payloadFixture( cscntLogPayload::SEVERITY_INFO );

        $storage = $this->filter->route( $payload );
        $this->assertEquals(
            0,
            $storage->count()
        );
    }

    public function testMultiGroupWithAtomicMatchPassed()
    {
        $payload1 = $this->payloadFixture( cscntLogPayload::SEVERITY_WARNING );
        $payload2 = $this->payloadFixture( cscntLogPayload::SEVERITY_ERROR );

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
        $payload1 = $this->payloadFixture( cscntLogPayload::SEVERITY_INFO );
        $payload2 = $this->payloadFixture( cscntLogPayload::SEVERITY_DEBUG );

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
        $payload1 = $this->payloadFixture( cscntLogPayload::SEVERITY_INFO );
        $payload2 = $this->payloadFixture( cscntLogPayload::SEVERITY_ERROR );

        $storage = $this->filter->route( $payload1 );
        $this->assertEquals(
            0,
            $storage->count()
        );

        $storage = $this->filter->route( $payload2 );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload1]
        );
        $this->assertEquals(
            array( "foo" ),
            $storage[$payload2]
        );
    }

    public function testMultiGroupWithSingleMatchPassed2()
    {
        $payload1 = $this->payloadFixture( cscntLogPayload::SEVERITY_ERROR );
        $payload2 = $this->payloadFixture( cscntLogPayload::SEVERITY_INFO );

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

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
