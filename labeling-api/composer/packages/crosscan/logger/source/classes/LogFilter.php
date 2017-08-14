<?php
abstract class cscntLogFilter extends cscntLogRoute
{
    /**
     * Storage for the set of writers used for output if the filter accepts the
     * payload
     *
     * @var array( cscntLogWriter )
     */
    protected $writers = array();

    /**
     * Construct a LogFilter which outputs every accepted payload to the given
     * set of writers.
     *
     * @param array $writers
     */
    public function __construct( array $writers )
    {
        $this->writers = $writers;
    }

    /**
     * Route a certain payload;
     *
     * Route the given payload to it's writers
     *
     * The return value of this Route is supposed to be an SplObjectStorage,
     * which contains an arbitrary amount of payload to be written out. The
     * SplObjectStorage is supposed to have an array attached to each of the
     * payloads, which contains writerIds this payload should be written to.
     *
     * This allows for the greatest possible flexibility in routing, as routes
     * are therefore capable to store before seen payloads in order to route
     * them later, as certain conditions become reality.
     *
     * The returned storage may be empty if the given payload shouldn't be
     * logged at this time.
     *
     * @param cscntLogPayload $payload
     * @return SplObjectStorage
     */
    public function route( cscntLogPayload $payload )
    {
        $storage = new \SplObjectStorage();

        $acceptance = $this->accept( $payload );

        // Support true/false as response for BC reasons
        if ( $acceptance === true )
        {
            $acceptance = array( $payload );
        }
        else if ( $acceptance === false )
        {
            $acceptance = array();
        }

        foreach( $acceptance as $acceptedPayload )
        {
            $storage[$acceptedPayload] = $this->writers;
        }

        return $storage;
    }

    /**
     * Accept or decline a certain payload.
     *
     * The return value decides wether payloads are logged to the defined
     * writers or not. The following possibilities for a return value exist:
     *
     * true:  Log the just provided payload
     * false|array(): ignore the payload just provided
     * array( payloads ): Log the given payloads to the defined writers.
     * Providing an array containing the just given payload is identical to
     * returning true
     *
     * @param cscntLogPayload $payload
     * @return boolean|array
     */
    protected abstract function accept( cscntLogPayload $payload );
}
