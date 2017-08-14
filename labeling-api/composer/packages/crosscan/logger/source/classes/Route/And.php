<?php
/**
 * Route which takes an arbitrary amount of other routes to form a logical and
 * between those.
 */
class cscntLogAndRoute extends cscntLogRoute
{
    /**
     * Routes which are coupled with a logical and
     *
     * @var array
     */
    protected $routes = array();

    /**
     * An SplObjectStorage holding a payload buffer for each received payload.
     *
     * Each payload will be associated with another SplObjectStorage holding
     * the routes it as been acknowledged by.
     *
     * Those buffers are needed, as the logical AND conjunction needs to be
     * recalculated as each payload is processed due to the incremental logging
     * behaviour.
     *
     * @var SplObjectStorage
     */
    protected $payloadBuffers;

    /**
     * Construct a route combining the given routes with a logical AND
     *
     * @param array( cscntLogRoutes ) $routes
     */
    public function __construct( array $routes )
    {
        $this->routes = $routes;
        $this->payloadBuffers = new SplObjectStorage();
    }

    /**
     * Route the given payload, by asking all registered routes for their
     * routing result and combining those with a logical AND
     *
     * @param cscntLogPayload $payload
     * @return array( string )
     */
    public function route( cscntLogPayload $payload )
    {
        foreach( $this->routes as $route )
        {
            // Join new results with old ones
            $storage = $route->route( $payload );
            foreach( $storage as $routedPayload )
            {
                $writers = $storage->getInfo();
                $this->bufferPayload( $route, $routedPayload, $writers );
            }
        }

        $intersection = $this->extractIntersectingPayloads();

        // Remove the handled payload/writer combinations from the buffered
        // list
        foreach( $intersection as $intersectingPayload )
        {
            $writers = $intersection->getInfo();

            $this->removeBufferedWriters( $intersectingPayload, $writers );
        }

        $this->cleanupPayloadBuffers();

        return $intersection;
    }

    /**
     * Remove the given buffered writers from all routes associated with the
     * given payload
     *
     * @param cscntLogPayload $payload
     * @param array $writers
     * @return void
     */
    protected function removeBufferedWriters( cscntLogPayload $payload, array $writers )
    {
        $payloadBuffer = $this->payloadBuffers[$payload];
        foreach( $payloadBuffer as $route )
        {
            $bufferedWriters = $payloadBuffer->getInfo();

            $payloadBuffer[$route] = array_diff(
                $bufferedWriters,
                $writers
            );
        }
    }

    /**
     * Clean up the stored payloadBuffers, by removing empty mapping tables.
     *
     * This does ensure faster lookup during the next computation cycle
     *
     * @return void
     */
    protected function cleanupPayloadBuffers()
    {
        $immutablePayloadBuffers = clone $this->payloadBuffers;

        foreach( $immutablePayloadBuffers as $payload )
        {
            $routes = $this->payloadBuffers->getInfo();
            if ( $routes === null )
            {
                continue;
            }

            $immutableRoutes = clone $routes;

            foreach( $immutableRoutes as $route )
            {
                $writers = $routes->getInfo();

                if ( count( $writers ) === 0 )
                {
                    $routes->detach( $route );
                }
            }

            if ( $routes->count() === 0 )
            {
                $this->payloadBuffers->detach( $payload );
            }
        }
    }

    /**
     * Add the given payload from the specified route with the given writers to
     * the payloadBuffers structure
     *
     * @param cscntLogRoute $route
     * @param cscntLogPayload $payload
     * @param array $writers
     * @return void
     */
    protected function bufferPayload( cscntLogRoute $route, cscntLogPayload $payload, array $writers )
    {
        if ( !isset( $this->payloadBuffers[$payload] ) )
        {
            // Payload has been seen for the first time
            $this->payloadBuffers[$payload] = new \SplObjectStorage();
        }

        if ( isset( $this->payloadBuffers[$payload][$route] ) )
        {
            $writers = array_merge(
                $this->payloadBuffers[$payload][$route],
                $writers
            );
        }

        $this->payloadBuffers[$payload][$route] = $writers;
    }

    /**
     * Scan the payloadBuffers for intersections based on a logical AND.
     * Extract and return them in one single SplObjectStorage
     *
     * @return SplObjectStorage
     */
    protected function extractIntersectingPayloads()
    {
        $intersectingPayloads = new \SplObjectStorage();

        // Find all payloads, which have been acknowledged by all Routes
        // and isolate their writers on the way
        foreach( $this->payloadBuffers as $payload )
        {
            $acknowledgedRoutes = $this->payloadBuffers->getInfo();

            if ( $acknowledgedRoutes->count() === count( $this->routes ) )
            {
                $collectedWriters = $this->collectWriters(
                    $acknowledgedRoutes
                );

                if ( count( $collectedWriters ) > 0 )
                {
                    $intersectingPayloads[$payload] = $collectedWriters;
                }
            }
        }

        return $intersectingPayloads;
    }

    /**
     * Isolate intersecting writers from an SplObjectStorage containing Route
     * => array( writer ) mappings
     *
     * @param \SplObjectStorage $acknowledgedRoutes
     * @return array( string )
     */
    protected function collectWriters( \SplObjectStorage $acknowledgedRoutes )
    {
        $intersectingWriters = null;
        foreach( $acknowledgedRoutes as $routes )
        {
            $writers = $acknowledgedRoutes->getInfo();

            if ( $intersectingWriters === null )
            {
                $intersectingWriters = $writers;
            }
            else
            {
                $intersectingWriters = array_intersect(
                    $intersectingWriters,
                    $writers
                );
            }
        }

        return array_values( $intersectingWriters );
    }
}
