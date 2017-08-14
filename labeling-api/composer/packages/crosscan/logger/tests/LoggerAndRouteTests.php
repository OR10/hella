<?php
class cscntLoggerAndRouteTests extends PHPUnit_Framework_TestCase
{
    protected function andRouteFixture( array $routeReturns )
    {
        $routes = array();
        foreach( $routeReturns as $retval )
        {
            $route = new cscntLogPredefinedRouteMock( $retval );
            $routes[] = $route;
        }

        return new cscntLogAndRoute( $routes );
    }

    protected function payloadFixture()
    {
        return $this->getMockForAbstractClass(
            'cscntLogPayload',
            array( cscntLogPayload::SEVERITY_INFO, "FooFacility", "BarId" )
        );
    }

    public function intersectionProvider()
    {
        return array(
            array(
                array( array( "foo" ), array( "foo" ) ),
                array( "foo" )
            ),
            array(
                array( array( "foo", "bar" ), array( "foo", "bar" ) ),
                array( "foo", "bar" )
            ),
            array(
                array( array( "foo" ), array( "foo", "bar" ) ),
                array( "foo" )
            ),
            array(
                array( array( "foo", "bar" ), array( "bar" ) ),
                array( "bar" )
            ),
            array(
                array( array( "foo" ), array( "bar" ) ),
                array()
            ),
            array(
                array( array( "foo" ), array( "bar" ), array( "baz" ) ),
                array()
            ),
            array(
                array( array( "foo", "bar" ), array( "baz", "foo" ), array( "yeah", "foo" ) ),
                array( "foo" )
            ),
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

        $andRoute = new cscntLogAndRoute( array( $route1, $route2 ) );

        $andRoute->route( $this->payloadFixture() );
    }

    /**
     * @dataProvider intersectionProvider
     */
    public function testRouteWriterIntersection( $routeResults, $expected )
    {
        $route = $this->andRouteFixture(
            $routeResults,
            1
        );

        $payload = $this->payloadFixture();

        $storage = $route->route( $payload );
        if ( count( $expected ) === 0 )
        {
            $this->assertEquals(
                0,
                $storage->count()
            );
        }
        else
        {
            $this->assertEquals(
                $expected,
                $storage[$payload]
            );
        }
    }

    public function testDelayedAcknowledgement()
    {
        $fakeReturnStorage = new \SplObjectStorage();
        $fakeEmptyReturnStorage = new \SplObjectStorage();

        $payload = $this->payloadFixture();
        $fakeReturnStorage[$payload] = array( 'foo' );

        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1->expects( $this->at( 0 ) )
               ->method( 'route' )
               ->will( $this->returnValue( $fakeReturnStorage ) );
        $route1->expects( $this->at( 1 ) )
               ->method( 'route' )
               ->will( $this->returnValue( $fakeEmptyReturnStorage ) );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2->expects( $this->at( 0 ) )
               ->method( 'route' )
               ->will( $this->returnValue( $fakeEmptyReturnStorage ) );
        $route2->expects( $this->at( 1 ) )
               ->method( 'route' )
               ->will( $this->returnValue( $fakeReturnStorage ) );

        $andRoute = new cscntLogAndRoute( array( $route1, $route2 ) );

        $storage = $andRoute->route( $payload );
        $this->assertEquals( 0, $storage->count() );
        $storage = $andRoute->route( $payload );
        $this->assertEquals( array( 'foo' ), $storage[$payload] );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
