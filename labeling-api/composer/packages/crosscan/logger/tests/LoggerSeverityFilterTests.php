<?php
class cscntLoggerSeverityFilterTests extends PHPUnit_Framework_TestCase
{
    protected function payloadFixture( $severity ) 
    {
        return $this->getMockForAbstractClass( 
            'cscntLogPayload',
            array( $severity, "FooFacility", "BarId" )
        );
    }

    public function payloadProvider() 
    {
        $severities = array( 
            cscntLogPayload::SEVERITY_DEBUG,
            cscntLogPayload::SEVERITY_INFO,
            cscntLogPayload::SEVERITY_WARNING,
            cscntLogPayload::SEVERITY_ERROR,
            cscntLogPayload::SEVERITY_FATAL,
        );

        $results = array();

        foreach( $severities as $payloadSeverity ) 
        {
            foreach( $severities as $threshold ) 
            {
                $results[] = array( 
                    $payloadSeverity,
                    $threshold,
                    $threshold <= $payloadSeverity
                );
            }
        }

        return $results;
    }

    public function testWritersArePassedThrough()
    {
        $payload = $this->payloadFixture( cscntLogPayload::SEVERITY_INFO );
        $filter = new cscntLogSeverityFilter(
            cscntLogPayload::SEVERITY_DEBUG,
            array( "foo", "bar", "baz" )
        );

        $storage = $filter->route( $payload );
        $this->assertEquals(
            array( "foo", "bar", "baz" ),
            $storage[$payload]
        );
    }

    /**
     * @dataProvider payloadProvider
     */
    public function testFilterBySeverityThreshold( $severity, $threshold, $accepted )
    {
        $filter = new cscntLogSeverityFilter(
            $threshold,
            array( "foo" )
        );

        $payload = $this->payloadFixture( $severity );

        $storage = $filter->route( $payload );
        if ( $accepted )
        {
            $this->assertEquals(
                array( "foo" ),
                $storage[$payload]
            );
        }
        else
        {
            $this->assertEquals(
                0,
                $storage->count()
            );
        }
    }

    public static function suite()
    {
        return new \PHPUnit_Framework_TestSuite( __CLASS__ );
    }
}

