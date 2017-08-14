<?php
class cscntLoggerOrRouteTests extends PHPUnit_Framework_TestCase
{
    protected function payloadFixture()
    {
        return $this->getMockForAbstractClass(
            'cscntLogPayload',
            array( cscntLogPayload::SEVERITY_INFO, "FooFacility", "BarId" )
        );
    }

    public function testRouteCalledForEachRoute()
    {
        $fakeReturnStorage = new \SplObjectStorage();
        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $fakeReturnStorage ) );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $fakeReturnStorage ) );

        $orRoute = new cscntLogOrRoute( array( $route1, $route2 ) );

        $orRoute->route( $this->payloadFixture() );
    }

    public function testNonIntersecting()
    {
        $route1ReturnStorage = new \SplObjectStorage();
        $payloadRoute1 = $this->payloadFixture();
        $route1ReturnStorage[$payloadRoute1] = array( 'foo' );

        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $route1ReturnStorage ) );

        $route2ReturnStorage = new \SplObjectStorage();
        $payloadRoute2 = $this->payloadFixture();
        $route2ReturnStorage[$payloadRoute2] = array( 'bar' );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $route2ReturnStorage ) );

        $orRoute = new cscntLogOrRoute( array( $route1, $route2 ) );

        $storage = $orRoute->route( $this->payloadFixture() );

        $this->assertEquals(
            array( 'foo' ),
            $storage[$payloadRoute1]
        );

        $this->assertEquals(
            array( 'bar' ),
            $storage[$payloadRoute2]
        );
    }

    public function testNonIntersectingSameWriters()
    {
        $route1ReturnStorage = new \SplObjectStorage();
        $payloadRoute1 = $this->payloadFixture();
        $route1ReturnStorage[$payloadRoute1] = array( 'foo' );

        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $route1ReturnStorage ) );

        $route2ReturnStorage = new \SplObjectStorage();
        $payloadRoute2 = $this->payloadFixture();
        $route2ReturnStorage[$payloadRoute2] = array( 'foo' );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $route2ReturnStorage ) );

        $orRoute = new cscntLogOrRoute( array( $route1, $route2 ) );

        $storage = $orRoute->route( $this->payloadFixture() );

        $this->assertEquals(
            array( 'foo' ),
            $storage[$payloadRoute1]
        );

        $this->assertEquals(
            array( 'foo' ),
            $storage[$payloadRoute2]
        );

        $this->assertEquals(
            2,
            $storage->count()
        );
    }

    public function testIntersecting()
    {
        $payload = $this->payloadFixture();

        $route1ReturnStorage = new \SplObjectStorage();
        $route1ReturnStorage[$payload] = array( 'foo' );

        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $route1ReturnStorage ) );

        $route2ReturnStorage = new \SplObjectStorage();
        $payloadRoute2 = $this->payloadFixture();
        $route2ReturnStorage[$payload] = array( 'bar' );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $route2ReturnStorage ) );

        $orRoute = new cscntLogOrRoute( array( $route1, $route2 ) );

        $storage = $orRoute->route( $this->payloadFixture() );

        $this->assertEquals(
            array( 'bar', 'foo' ),
            $storage[$payload]
        );

        $this->assertEquals(
            1,
            $storage->count()
        );
   }

    public function testIntersectingSameWriters()
    {
        $returnStorage = new \SplObjectStorage();
        $payload = $this->payloadFixture();
        $returnStorage[$payload] = array( 'foo' );

        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $returnStorage ) );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $returnStorage ) );

        $orRoute = new cscntLogOrRoute( array( $route1, $route2 ) );

        $storage = $orRoute->route( $this->payloadFixture() );

        $this->assertEquals(
            array( 'foo' ),
            $storage[$payload]
        );

        $this->assertEquals(
            1,
            $storage->count()
        );
    }

    public function testExceptionInOneRouteDoesNotHarmOthers()
    {
        $returnStorage = new \SplObjectStorage();
        $payload = $this->payloadFixture();
        $returnStorage[$payload] = array( 'foo' );

        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->throwException( new \Exception() ) );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2->expects( $this->once() )
               ->method( 'route' )
               ->will( $this->returnValue( $returnStorage ) );

        $orRoute = new cscntLogOrRoute( array( $route1, $route2 ) );

        $storage = $orRoute->route( $this->payloadFixture() );

        $this->assertEquals(
            array( 'foo' ),
            $storage[$payload]
        );

        $this->assertEquals(
            1,
            $storage->count()
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
