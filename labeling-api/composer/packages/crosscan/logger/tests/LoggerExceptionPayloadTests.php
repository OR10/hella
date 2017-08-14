<?php
class cscntLoggerExceptionPayloadTests extends PHPUnit_Framework_TestCase
{
    protected function getPayload( $exception = null )
    {
        if ( $exception === null )
        {
            $exception = new \Exception( "Foobar Exception Message" );
        }

        return new cscntLogExceptionPayload(
            cscntLogPayload::SEVERITY_INFO,
            "FooFacility",
            "BarId",
            $exception
        );
    }

    public function testStringProducer()
    {
        $exception = new \Exception( "String provider test exception message" );
        $payload = $this->getPayload( $exception );
        $this->assertStringStartsWith(
            "Exception thrown in " . __FILE__ . '(21): String provider test exception message',
            $payload->__toString()
        );
    }

    public function testJsonProducer()
    {
        $exception = new cscntLoggerTestExceptionMock();
        $payload = $this->getPayload( $exception );
        $this->assertSame(
            '{"logPayloadType":"Exception","exceptionClass":"cscntLoggerTestExceptionMock","message":"Some message","code":0,"file":"some\/file\/somewhere.php","line":42,"stackTrace":[{"function":"someFunction","class":"someClass","type":"->","args":["foo","bar"]},{"file":"\/some\/absolute\/path.php","line":23,"function":"someOtherFunction","class":"someOtherClass","type":"->","args":["baz"]}],"fullMessage":"cscntLoggerTestExceptionMock thrown in some\/file\/somewhere.php(42): Some message\nTRACE"}',
            json_encode( $payload->toHierarchicalArrayStruct() )
        );
    }

    public function testJsonProducerWithPreviousChain()
    {
        $previous = new cscntLoggerTestExceptionMock();
        $exception = new cscntLoggerTestExceptionMock( $previous );

        $payload = $this->getPayload( $exception );

        $this->assertSame(
            '{"logPayloadType":"Exception","exceptionClass":"cscntLoggerTestExceptionMock","message":"Some message","code":0,"file":"some\/file\/somewhere.php","line":42,"stackTrace":[{"function":"someFunction","class":"someClass","type":"->","args":["foo","bar"]},{"file":"\/some\/absolute\/path.php","line":23,"function":"someOtherFunction","class":"someOtherClass","type":"->","args":["baz"]}],"fullMessage":"cscntLoggerTestExceptionMock thrown in some\/file\/somewhere.php(42): Some message\nTRACE","previous":{"logPayloadType":"Exception","exceptionClass":"cscntLoggerTestExceptionMock","message":"Some message","code":0,"file":"some\/file\/somewhere.php","line":42,"stackTrace":[{"function":"someFunction","class":"someClass","type":"->","args":["foo","bar"]},{"file":"\/some\/absolute\/path.php","line":23,"function":"someOtherFunction","class":"someOtherClass","type":"->","args":["baz"]}],"fullMessage":"cscntLoggerTestExceptionMock thrown in some\/file\/somewhere.php(42): Some message\nTRACE"}}',
            json_encode( $payload->toHierarchicalArrayStruct() )
        );
    }


    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
