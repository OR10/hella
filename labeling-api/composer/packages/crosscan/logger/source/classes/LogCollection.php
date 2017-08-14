<?php

/**
 * Generic implementation for ArrayAccessable collections of different Log
 * based objects
 */
abstract class cscntLogCollection implements ArrayAccess, Countable, IteratorAggregate
{
    /**
     * Properties stored in this collection
     *
     * @var array
     */
    protected $properties = array();

    /**
     * Set the given key value information.
     *
     * @param mixed $key
     * @param mixed $value
     * @return void
     */
    public function __set( $key, $value )
    {
        if ( $key === null )
        {
            $this->properties[] = $value;
        }
        else
        {
            $this->properties[$key] = $value;
        }
    }

    /**
     * Retrieve a before stored value
     *
     * @throws \crosscan\Exception\PropertyNotFound if not value has been stored
     * using the requested key before
     *
     * @param mixed $key
     * @return mixed
     */
    public function __get( $key )
    {
        if ( array_key_exists( $key, $this->properties ) !== true )
        {
            throw new crosscan\Exception\PropertyNotFound( $key );
        }

        return $this->properties[$key];
    }

    /**
     * Check if a given array offset is declared
     *
     * @param mixed $key
     * @return bool
     */
    public function offsetExists( $key )
    {
        return array_key_exists(
            $key,
            $this->properties
        );
    }

    /**
     * Unset a already defined array offset
     *
     * @param mixed $key
     * @return void
     */
    public function offsetUnset( $key )
    {
        unset( $this->properties[$key] );
    }

    /**
     * Retrieve a certain value for a declared key using ArrayAccess
     *
     * @throws \crosscan\Exception\PropertyNotFound if the accessed property is not
     * set.
     *
     * @param mixed $key
     * @return mixed
     */
    public function offsetGet( $key )
    {
        return $this->__get( $key );
    }

    /**
     * Set a certain value for a given key using ArrayAccess
     *
     * @param mixed $key
     * @param mixed $value
     * @return void
     */
    public function offsetSet( $key, $value )
    {
        $this->__set( $key, $value );
    }

    /**
     * Return the count of currently defined items in the collection
     *
     * @return int
     */
    public function count()
    {
        return count( $this->properties );
    }

    /**
     * Return an iterator for the properties of this collection
     *
     * @return Traversable
     */
    public function getIterator()
    {
        return new ArrayIterator( $this->properties );
    }

    /**
     * Access the registered collection data as raw array structure for further
     * processing.
     *
     * Please note, that by changing the returned array structure you are not
     * changing the collection.
     *
     * @return array
     */
    public function getRawArray()
    {
        return $this->properties;
    }
}
