<?php
class cscntLoggerStringPayloadTests extends PHPUnit_Framework_TestCase
{
    protected function payloadFixture( $string ) 
    {
        return new cscntLogStringPayload( 
            cscntLogPayload::SEVERITY_INFO,
            "FooFacility",
            "BarId",
            $string
        );
    }
    
    public function payloadProvider() 
    {
        return array( 
            array( 
                $this->payloadFixture( "Some simple string" ),
                "Some simple string"
            ),
            array(
                $this->payloadFixture( 42 ),
                "42"
            ),
            array(
                $this->payloadFixture( 23.5 ),
                "23.5"
            ),
            array(
                $this->payloadFixture( true ),
                "true"
            ),
            array(
                $this->payloadFixture( null ),
                "null"
            ),
        );
    }

    /**
     * @dataProvider payloadProvider
     */
    public function testStringProducer( $payload, $expected ) 
    {
        $this->assertSame( 
            $expected,
            $payload->__toString()
        );
    }


    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
