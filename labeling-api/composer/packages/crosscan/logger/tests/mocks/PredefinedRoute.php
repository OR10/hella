<?php
class cscntLogPredefinedRouteMock extends cscntLogRoute
{
    protected $predefinedMockedResponse;

    public function __construct( array $response )
    {
        $this->predefinedMockedResponse = $response;
    }

    public function route( cscntLogPayload $payload )
    {
        $storage = new \SplObjectStorage();
        if( count( $this->predefinedMockedResponse ) > 0 )
        {
            $storage[$payload] = $this->predefinedMockedResponse;
        }

        return $storage;
    }
}
