<?php
class cscntLogFooMockPayload extends cscntLogPayload implements cscntLogFooMockProducer
{
    public $producedFooMocks = 0;
    public $producedStrings = 0;

    public function __construct()
    {
        parent::__construct( self::SEVERITY_INFO, 'Foobar', 'baz' );
    }

    public function getProducerPriority()
    {
        return array(
            'FooMock',
            'String'
        );
    }

    public function __toString()
    {
        $this->producedStrings += 1;
    }

    public function toFooMock()
    {
        $this->producedFooMocks += 1;
    }
}
