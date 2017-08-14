<?php
/**
 * Struct for holding option collections of the cscntLogger system
 *
 * @property-read cscntLogWriterCollection $writers Collection of the currently
 * registered log writers
 *
 * @property-read cscntLogRouteCollection Collection of the currently
 * registered log routes
 */
class cscntLogOptions
{
    /**
     * Stored read-only properties
     *
     * @var array
     */
    protected $properties = array(
        'writers' => null,
        'routes'  => null,
    );

    /**
     * Construct a struct holding a writer and route collection
     */
    public function __construct()
    {
        $this->properties['writers'] = new cscntLogWriterCollection();
        $this->properties['routes']  = new cscntLogRouteCollection();
    }

    /**
     * Disallow setting of any property from the outside
     *
     * @throws \crosscan\Exception\PropertyPermission always, because only read
     * access is allowed
     * @throws \crosscan\Exception\PropertyNotFound if an invalid property has been
     * requested
     *
     * @param mixed $key
     * @param mixed $value
     * @return void
     */
    public function __set( $key, $value )
    {
        if ( array_key_exists( $key, $this->properties ) !== true )
        {
            throw new \crosscan\Exception\PropertyNotFound( $key );
        }

        throw new \crosscan\Exception\PropertyPermission(
            $key,
            \crosscan\Exception\PropertyPermission::READ
        );
    }

    /**
     * Return the read-only accessible property objects
     *
     * @throws \crosscan\Exception\PropertyNotFound if an invalid property has been
     * requested
     *
     * @param mixed $key
     * @return void
     */
    public function __get( $key )
    {
        if ( array_key_exists( $key, $this->properties ) !== true )
        {
            throw new \crosscan\Exception\PropertyNotFound( $key );
        }

        return $this->properties[$key];
    }
}
