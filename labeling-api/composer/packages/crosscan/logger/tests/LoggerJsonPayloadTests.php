<?php
class cscntLoggerJsonPayloadTests extends PHPUnit_Framework_TestCase
{
    protected $payload = null;

    protected $document = null;

    public function setUp() 
    {
        $this->document = json_decode( file_get_contents( __DIR__ . '/data/json.json' ) );
        $this->json = json_encode( $this->document );

        $this->payload = new cscntLogJsonPayload( 
            cscntLogPayload::SEVERITY_INFO,
            "FooFacility",
            "BarId",
            $this->document
        );
    }

    public function testJsonProducer() 
    {
        $this->assertEquals( 
            json_encode( $this->document ),
            json_encode( $this->payload->toHierarchicalArrayStruct() )
        );
    }

    public function testConstructionWithJsonString() 
    {
        $payload = new cscntLogJsonPayload( 
            cscntLogPayload::SEVERITY_INFO,
            "FooFacility",
            "BarId",
            $this->json
        );

        $this->assertEquals( 
            $this->json,
            json_encode( $payload->toHierarchicalArrayStruct() )
        );
    }

    public function testStringProducerWithShortDocument() 
    {
        $payload = new cscntLogJsonPayload( 
            cscntLogPayload::SEVERITY_INFO,
            "FooFacility",
            "BarId",
            '{"foo": "bar"}'
        );

        $this->assertEquals( 
            '{"foo":"bar"}',
            $payload->__toString()
        );
    }

    public function testStringProducerWithLongDocument() 
    {
        $this->assertEquals( 
            substr( $this->json, 0, 72 ) . '…',
            $this->payload->__toString()
        );
    }

    /**
     * @expectedException cscntInvalidJsonException
     */
    public function testExceptionThrownIfConstructedWithInvalidJson() 
    {
        $payload = new cscntLogJsonPayload( 
            cscntLogPayload::SEVERITY_INFO,
            "FooFacility",
            "BarId",
            '{some: invalid json}'
        );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
