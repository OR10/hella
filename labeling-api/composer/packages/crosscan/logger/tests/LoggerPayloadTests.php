<?php
class cscntLoggerPayloadTests extends PHPUnit_Framework_TestCase
{
    public function propertyProvider() 
    {
        return array( 
            array( "severity", cscntLogPayload::SEVERITY_INFO ),
            array( "facility", "FooFacility" ),
            array( "id", "BarId" )
        );
    }

    public function overiddenPropertyProvider() 
    {
        return array( 
            array( "severity", cscntLogPayload::SEVERITY_DEBUG ),
            array( "facility", "overiddenFacility" ),
            array( "id", "overiddenId" )
        );
    }

    public function textualSeverityProvider() 
    {
        return array( 
            array( cscntLogPayload::SEVERITY_DEBUG, "Debug" ),
            array( cscntLogPayload::SEVERITY_INFO, "Info" ),
            array( cscntLogPayload::SEVERITY_WARNING, "Warning" ),
            array( cscntLogPayload::SEVERITY_ERROR, "Error" ),
            array( cscntLogPayload::SEVERITY_FATAL, "Fatal" ),
        );
    }

    public function payloadFixture( $class = 'cscntLogPayload', $severity = cscntLogPayload::SEVERITY_INFO, $facility = "FooFacility", $id = "BarId" )
    {
        return $this->getMockForAbstractClass(
            $class,
            array( $severity, $facility, $id )
        );
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testInvalidPropertyReadAccessProhibited() 
    {
        $payload = $this->payloadFixture();
        $payload->foobar;
    }

    /**
     * @expectedException \crosscan\Exception\PropertyNotFound
     */
    public function testInvalidPropertyWriteAccessProhibited() 
    {
        $payload = $this->payloadFixture();
        $payload->foobar = "baz";
    }

    /**
     * @dataProvider propertyProvider
     */
    public function testPropertiesReadAccess( $property, $expected ) 
    {
        $payload = $this->payloadFixture();
        
        $this->assertEquals( 
            $expected,
            $payload->$property
        );
    }

    /**
     * @dataProvider propertyProvider
     * @expectedException \crosscan\Exception\PropertyPermission
     */
    public function testPropertyWriteAccessProhibited( $property, $expected ) 
    {
        $payload = $this->payloadFixture();
        $payload->$property = "foo";
    }

    /**
     * @dataProvider overiddenPropertyProvider
     */
    public function testPropertyAccessMapsToProtectedFunction( $property, $expected ) 
    {
        $payload = $this->payloadFixture( 'cscntLogOveriddenPayloadMock' );

        $this->assertEquals( 
            $expected,
            $payload->$property
        );
    }

    public function testDefaultTypePriorization() 
    {
        $payload = $this->payloadFixture();
        $this->assertEquals( 
            array(),
            $payload->getProducerPriority()
        );
    }

    /**
     * @dataProvider textualSeverityProvider
     */
    public function testSeverityLevelTextualConversion( $severity, $expected ) 
    {
        $this->assertEquals( 
            $expected,
            cscntLogPayload::getTextualSeverity( $severity )
        );
    }

    /**
     * @expectedException RuntimeException
     */
    public function testExceptionThrownOnUnknownSeverityTextualConversion() 
    {
        cscntLogPayload::getTextualSeverity( 423 );
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}
