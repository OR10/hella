<?php
class cscntLogNoopRouteMock extends cscntLogRoute
{
    protected $mockedWriterReturn;

    public function __construct( $writers )
    {
        $this->mockedWriterReturn = $writers;
    }

    public function route( cscntLogPayload $payload )
    {
        $storage = new \SplObjectStorage();
        $storage[$payload] = $this->mockedWriterReturn;
        return $storage;
    }
}
