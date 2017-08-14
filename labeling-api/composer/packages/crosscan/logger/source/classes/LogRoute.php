<?php
abstract class cscntLogRoute
{
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
    public abstract function route( cscntLogPayload $payload );
}
