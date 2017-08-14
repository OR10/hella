<?php
/**
 * Route which takes an arbitrary amount of other routes to form a logical OR
 * between those.
 */
class cscntLogOrRoute extends cscntLogRoute
{
    /**
     * Routes, which are logically ored
     *
     * @var array( cscntLogRoute )
     */
    protected $routes;

    /**
     * Create a new OR route taking the routes to combine as argument
     *
     * @param array $routes
     */
    public function __construct( array $routes )
    {
        $this->routes = $routes;
    }

    /**
     * Route the given payload by issuing a route command to all registered
     * routes and combining the response data in a meaningful way.
     *
     * @param cscntLogPayload $payload
     * @return SplObjectStorage
     */
    public function route( cscntLogPayload $payload )
    {
        $buffer = new \SplObjectStorage();

        foreach( $this->routes as $route )
        {
            try
            {
                $storage = $route->route( $payload );
            }
            catch( \Exception $e )
            {
                // The failure of one route should not harm other possible
                // routes. As we are logically combining with an OR here
                // one failing route should not harm other routes from
                // providing proper output.
                // @TODO: Actually this failure should be logged somewhere, but
                // where?
                $storage = new \SplObjectStorage();
            }

            $buffer = $this->mergeRouteResults( $buffer, $storage );
        }

        return $buffer;
    }

    /**
     * Merge the one route result SplObjectStorage with another one.
     *
     * The stored writer lists will be merged and unified.
     *
     * @param \SplObjectStorage $master
     * @param \SplObjectStorage $slave
     * @return \SplObjectStorage
     */
    protected function mergeRouteResults( \SplObjectStorage $master, \SplObjectStorage $slave )
    {
        $merged = clone $master;
        foreach( $slave as $payload )
        {
            $writers = $slave->getInfo();
            if ( isset( $merged[$payload] ) )
            {
                $writers = array_unique(
                    array_merge(
                        $writers,
                        $merged[$payload]
                    )
                );
            }
            $merged[$payload] = $writers;
        }

        return $merged;
    }
}
