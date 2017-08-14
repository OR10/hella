<?php

class cscntLogFooMockWriter extends cscntLogWriter implements cscntLogFooMockConsumer
{
    public $consumedFooMocks = 0;

    public function setGroup( $group )
    {

    }

    public function fromString( $severity, $facility, $id, $logData )
    {
        throw new RuntimeException( "Consuming from String instead of FooMock something is wrong" );
    }

    public function fromFooMock()
    {
        $this->consumedFooMocks += 1;
    }
}
