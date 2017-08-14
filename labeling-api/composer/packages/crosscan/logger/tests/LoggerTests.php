<?php
class cscntLoggerTests extends PHPUnit_Framework_TestCase
{
    protected function getPayload( array $priorities = array(), $returnString = "", $usageCount = 1 )
    {
        $payload = $this->getMock(
            'cscntLogPayload',
            array( 'getProducerPriority', '__toString' ),
            array(),
            '',
            false // Do not call base constructor
        );

        $payload->expects( $this->exactly( $usageCount ) )
            ->method( 'getProducerPriority' )
            ->will( $this->returnValue( $priorities ) );

        $payload->expects( $this->exactly( $usageCount ) )
            ->method( '__toString' )
            ->will( $this->returnValue( $returnString ) );

        return $payload;
    }

    public function routesProvider()
    {
        $payload = $this->payloadMock();

        $fooReturn = new \SplObjectStorage();
        $fooReturn[$payload] = array( 'foo' );
        $fooRoute = $this->getMock( 'cscntLogRoute', array( 'route' ) );
        $fooRoute->expects( $this->exactly( 2 ) )
            ->method( 'route' )
            ->will( $this->returnValue( $fooReturn ) );

        $barReturn = new \SplObjectStorage();
        $barReturn[$payload] = array( 'bar', 'foo' );
        $barRoute = $this->getMock( 'cscntLogRoute', array( 'route' ) );
        $barRoute->expects( $this->exactly( 2 ) )
            ->method( 'route' )
            ->will( $this->returnValue( $barReturn ) );

        $fooWriter = $this->getMock( 'cscntLogWriter', array( 'setGroup', 'fromString' ) );
        $fooWriter->expects( $this->exactly( 3 ) )
            ->method( 'fromString' );

        $barWriter = $this->getMock( 'cscntLogWriter', array( 'setGroup', 'fromString' ) );
        $barWriter->expects( $this->exactly( 3 ) )
            ->method( 'fromString' );

        return array(
            array(
                array( $fooRoute ),
                array( 'foo' => $fooWriter ),
                $payload
            ),
            array(
                array( $barRoute ),
                array( 'foo' => $fooWriter, 'bar' => $barWriter ),
                $payload
            ),
            array(
                array( $fooRoute, $barRoute ),
                array( 'foo' => $fooWriter, 'bar' => $barWriter ),
                $payload
            )
        );
    }

    public function setUp()
    {
        $this->logger = $this->loggerFixture();
    }

    protected function loggerFixture( $class = 'cscntLogger', $options = null )
    {
        return new $class( $options );
    }

    protected function payloadMock( $severity = cscntLogPayload::SEVERITY_INFO, $facility = "FooFacility", $id = "BarId" )
    {
        return $this->getMockForAbstractClass(
            'cscntLogPayload',
            array( $severity, $facility, $id )
        );
    }

    protected function prefilledOptionsMock( $writers = array(), $routes = array() )
    {
        return new cscntLogPrefilledOptionsMock( $writers, $routes );
    }

    public function testOptionsPropertyRead()
    {
        $this->logger->options;
    }

    public function testDefaultOptionInitialization()
    {
        $this->assertInstanceOf(
            "cscntLogOptions",
            $this->logger->options
        );
    }

    /**
     * @expectedException \crosscan\Exception\PropertyPermission
     */
    public function testOptionsPropertyWriteProhibited()
    {
        $this->logger->options = "foo";
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testInvalidPropertyRead() {
        $this->logger->foobar;
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testInvalidPropertyWrite()
    {
        $this->logger->foo = "bar";
    }

    public function testCustomOptionsInjection()
    {
        $options = new cscntLogNoopOptionsMock();
        $logger = $this->loggerFixture( 'cscntLogger', $options );
        $this->assertSame(
            $options,
            $logger->options
        );
    }

    /**
     * @dataProvider routesProvider
     */
    public function testRoutingTableGeneration( $routes, $writers, $payload )
    {
        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                $writers,
                $routes
            )
        );

        $logger->log( $payload );
    }

    public function testEmptyExtractedPrioritizedTypesDefaultToString()
    {
        $payload = $this->getPayload( array() );

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->once() )
            ->method( 'fromString' );

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo' );
        $route->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
    }

    public function testExtractedPrioritizedTypesDefaultToString()
    {
        $payload = $this->getPayload( array( 'Foo', 'Bar' ) );

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->once() )
            ->method( 'fromString' );

        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo' );
        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
    }

    public function testMatchingTypeDetermination()
    {
        $payload = new cscntLogFooMockPayload();
        $writer = new cscntLogFooMockWriter();
        $route = new cscntLogNoopRouteMock( array( 'foo' ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );

        $this->assertSame( 1, $payload->producedFooMocks );
        $this->assertSame( 0, $payload->producedStrings );
        $this->assertSame( 1, $writer->consumedFooMocks );
    }

    public function testMatchingTypeDeterminationWithString()
    {
        $payload = new cscntLogFooMockPayload();
        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->once() )
            ->method( 'fromString' );
        $route = new cscntLogNoopRouteMock( array( 'foo' ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );

        $this->assertSame( 0, $payload->producedFooMocks );
        $this->assertSame( 1, $payload->producedStrings );
    }

    public function testAllPayloadsWritten()
    {
        $payload = $this->getPayload( array(), 'payload' );
        $anotherPayload = $this->getPayload(array(), 'another payload' );

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->at( 1 ) )
            ->method( 'fromString' )
            ->with(
                $this->anything(),
                $this->anything(),
                $this->anything(),
                $this->equalTo( 'payload' )
        );
        $writer->expects( $this->at( 3 ) )
            ->method( 'fromString' )
            ->with(
                $this->anything(),
                $this->anything(),
                $this->anything(),
                $this->equalTo( 'another payload' )
        );
        $writer->expects( $this->exactly( 2 ) )
            ->method( 'fromString' );

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo' );
        $routeReturn[$anotherPayload] = array( 'foo' );

        $route->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
    }

    public function testGroupSetBeforeWrite()
    {
        $payload = $this->getPayload( array(), 'payload' );

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->exactly( 1 ) )
            ->method( 'setGroup' );

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo' );

        $route->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
    }

    public function testSameGroupForMultipleCalls()
    {
        $payload = $this->getPayload( array(), 'payload' );
        $anotherPayload = $this->getPayload(array(), 'another payload' );

        $writer = new cscntLogGroupWriterMock();

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn1 = new \SplObjectStorage();
        $routeReturn2 = new \SplObjectStorage();
        $routeReturn2[$payload] = array( 'foo' );
        $routeReturn2[$anotherPayload] = array( 'foo' );

        $route->expects( $this->at( 0 ) )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn1 ) );
        $route->expects( $this->at( 1 ) )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn2 ) );
        $route->expects( $this->exactly( 2 ) )
            ->method( 'route' );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
        $logger->log( $anotherPayload );

        $uuid = $writer->setGroupMocked[0];
        $this->assertEquals(
            array( $uuid, $uuid ),
            $writer->setGroupMocked
        );
    }

    public function testNewGroup()
    {
        $payload = $this->getPayload( array(), 'payload' );
        $anotherPayload = $this->getPayload(array(), 'another payload' );

        $writer = new cscntLogGroupWriterMock();

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn1 = new \SplObjectStorage();
        $routeReturn1[$payload] = array( 'foo' );
        $routeReturn2 = new \SplObjectStorage();
        $routeReturn2[$anotherPayload] = array( 'foo' );

        $route->expects( $this->at( 0 ) )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn1 ) );
        $route->expects( $this->at( 1 ) )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn2 ) );
        $route->expects( $this->exactly( 2 ) )
            ->method( 'route' );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
        $logger->newGroup();
        $logger->log( $anotherPayload );

        $this->assertEquals(
            2,
            count( $writer->setGroupMocked )
        );
        $this->assertNotEquals(
            $writer->setGroupMocked[0],
            $writer->setGroupMocked[1]
        );
    }

    public function testWritingToTwoWriters()
    {
        $payload = $this->getPayload( array(), 'payload', 2 );

        $writer1 = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer1->expects( $this->exactly( 1 ) )
            ->method( 'fromString' );

        $writer2 = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer1->expects( $this->exactly( 1 ) )
            ->method( 'fromString' );

        $route1 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route1Return = new \SplObjectStorage();
        $route1Return[$payload] = array( 'foo', 'bar' );

        $route1->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $route1Return ) );

        $route2 = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $route2Return = new \SplObjectStorage();
        $route2Return[$payload] = array( 'foo', 'bar' );

        $route2->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $route2Return ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer1, 'bar' => $writer2 ),
                array( $route1, $route2 )
            )
        );

        $logger->log( $payload );
    }

    public function testExceptionInWriterDoesNotHarmOthers()
    {
        $payload   = $this->getPayload( array(), 'payload', 2 );
        $exception = new \Exception();

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->once() )
            ->method( 'fromString' )
            ->with(
                $this->anything(),
                $this->anything(),
                $this->anything(),
                $this->equalTo( 'payload' )
        );

        $failingWriter = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $failingWriter->expects( $this->once() )
            ->method( 'fromString' )
            ->will( $this->throwException( $exception ) );

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo', 'bar' );

        $errorPayload = new \crosscan\Logger\Payload\LoggerError(
            \cscntLogPayload::SEVERITY_ERROR,
            \cscntLogFacility::LOGGER,
            'logwriter',
            $exception,
            'Failed to write payload to writer',
            array(
                'originalPayload' => $payload
            )
        );

        $errorReturn = new \SplObjectStorage();
        $errorReturn[$errorPayload] = array( 'foo', 'bar' );

        $route->expects($this->exactly(2))
            ->method('route')
            ->will(
                $this->returnValueMap(
                    array(
                        array($payload, $routeReturn),
                        array($errorPayload, $errorReturn),
                    )
                )
            );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $failingWriter, 'bar' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
    }

    public function testFailingRouteDoesNotHarmOthers()
    {
        $payload = $this->getPayload( array(), 'payload' );

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->once() )
            ->method( 'fromString' )
            ->with(
                $this->anything(),
                $this->anything(),
                $this->anything(),
                $this->equalTo( 'payload' )
        );

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo' );

        $route->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn ) );

        $failingRoute = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );

        $failingRoute->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->throwException( new \Exception ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $failingRoute, $route )
            )
        );

        $logger->log( $payload );
    }

    public function testFailingPayloadDoesNotHarmOthers()
    {
        $payload = $this->getMock(
            'cscntLogPayload',
            array( 'getProducerPriority', '__toString' ),
            array(),
            '',
            false // Do not call base constructor
        );

        $payload->expects( $this->once() )
            ->method( 'getProducerPriority' )
            ->will( $this->throwException( new \Exception() ) );

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->never() )
            ->method( 'fromString' );

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo' );

        $route->expects( $this->once() )
            ->method( 'route' )
            ->will( $this->returnValue( $routeReturn ) );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
    }

    public function testFailingPayloadDoesNotHarmOthers2()
    {
        $payload = $this->getMock(
            'cscntLogPayload',
            array( 'getProducerPriority', '__toString' ),
            array(),
            '',
            false // Do not call base constructor
        );
        $exception = new \Exception();

        $payload->expects( $this->once() )
            ->method( 'getProducerPriority' )
            ->will( $this->returnValue( array() ) );
        $payload->expects( $this->once() )
            ->method( '__toString' )
            ->will( $this->throwException( $exception ) );

        $writer = $this->getMock(
            'cscntLogWriter',
            array( 'setGroup', 'fromString' )
        );
        $writer->expects( $this->never() )
            ->method( 'fromString' );

        $route = $this->getMock(
            'cscntLogRoute',
            array( 'route' )
        );
        $routeReturn = new \SplObjectStorage();
        $routeReturn[$payload] = array( 'foo' );

        $errorPayload = new \crosscan\Logger\Payload\LoggerError(
            \cscntLogPayload::SEVERITY_ERROR,
            \cscntLogFacility::LOGGER,
            'logwriter',
            $exception,
            'Failed to write payload to writer',
            array(
                'originalPayload' => $payload
            )
        );

        $errorReturn = new \SplObjectStorage();
        $errorReturn[$errorPayload] = array( 'foo' );

        $route->expects($this->exactly(2))
            ->method('route')
            ->will(
                $this->returnValueMap(
                    array(
                        array($payload, $routeReturn),
                        array($errorPayload, $errorReturn),
                    )
                )
            );

        $logger = $this->loggerFixture(
            'cscntLogger',
            $this->prefilledOptionsMock(
                array( 'foo' => $writer ),
                array( $route )
            )
        );

        $logger->log( $payload );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
