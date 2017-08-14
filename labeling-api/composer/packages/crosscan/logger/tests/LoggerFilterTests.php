<?php
class cscntLoggerFilterTests extends PHPUnit_Framework_TestCase
{
    protected $filter = null;
    protected $payload = null;

    public function setUp() 
    {
        $this->filter = $this->getMockForAbstractClass( 
            'cscntLogFilter',
            array( array( 'foo', 'bar', 'baz' ) )
        );

        $this->payload = $this->getMockForAbstractClass( 
            'cscntLogPayload',
            array( cscntLogPayload::SEVERITY_INFO, 'FooFacility', 'BarId' )
        );
    }

    public function testAcceptCalledForAcceptance()
    {
        $this->filter->expects( $this->once() )
            ->method( 'accept' )
            ->will( $this->returnValue( true ) );

        $storage = $this->filter->route( $this->payload );
        $this->assertEquals(
            array( 'foo', 'bar', 'baz' ),
            $storage[$this->payload]
        );
    }

    public function testAcceptCalledForRefusal()
    {
        $this->filter->expects( $this->once() )
            ->method( 'accept' )
            ->will( $this->returnValue( false ) );

        $storage = $this->filter->route( $this->payload );
        $this->assertEquals(
            0,
            $storage->count()
        );
    }

    public function testAcceptCalledForEachPayload()
    {
        $payload2 = $this->getMockForAbstractClass(
            'cscntLogPayload',
            array( cscntLogPayload::SEVERITY_INFO, 'FooFacility', 'BarId' )
        );

        $this->filter->expects( $this->exactly( 2 ) )
            ->method( 'accept' )
            ->will( $this->onConsecutiveCalls( false, true ) );

        $storage = $this->filter->route( $this->payload );
        $this->assertEquals(
            0,
            $storage->count()
        );

        $storage = $this->filter->route( $this->payload );
        $this->assertEquals(
            array( 'foo', 'bar', 'baz' ),
            $storage[$this->payload]
        );
    }

    public function testAcceptRefusalByEmptyArray()
    {
        $this->filter->expects( $this->once() )
            ->method( 'accept' )
            ->will( $this->returnValue( array() ) );

        $storage = $this->filter->route( $this->payload );
        $this->assertEquals(
            0,
            $storage->count()
        );
    }

    public function testAcceptAcceptanceBySimpleArray()
    {
        $this->filter->expects( $this->once() )
            ->method( 'accept' )
            ->will( $this->returnValue( array( $this->payload ) ) );

        $storage = $this->filter->route( $this->payload );
        $this->assertEquals(
            array( 'foo', 'bar', 'baz' ),
            $storage[$this->payload]
        );
    }

    public function testAcceptAcceptanceByMultiArray()
    {
        $payload2 = $this->getMockForAbstractClass(
            'cscntLogPayload',
            array( cscntLogPayload::SEVERITY_INFO, 'FooFacility', 'BarId' )
        );

        $returnedPayloads = array(
            $this->payload,
            $payload2
        );

        $this->filter->expects( $this->once() )
            ->method( 'accept' )
            ->will( $this->returnValue( $returnedPayloads ) );

        $storage = $this->filter->route( $this->payload );
        $this->assertEquals(
            array( 'foo', 'bar', 'baz' ),
            $storage[$this->payload]
        );
        $this->assertEquals(
            array( 'foo', 'bar', 'baz' ),
            $storage[$payload2]
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
