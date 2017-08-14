<?php

namespace crosscan\Std\ImageMetadata;

use crosscan\Exception;

/**
 * Storage and retrieval container for image related metadata information
 *
 * In ImageMetadata implementation is capable of extracting certain information 
 * like width, height, etc,,, out of given image data.
 *
 * The base implementation does provide all necessary means to cache calculated 
 * information once it has been generated and return this cache on consecutive 
 * access.
 *
 * @property-read int $width Width of the image
 * @property-read int $height Height of the image
 *
 * TODO: Extend this class and all implementation to support further meta 
 * information as soon as this is needed.
 */
abstract class ImageMetadata
{
    /**
     * Internal storage for cached property values 
     * 
     * @var array
     */
    protected $properties = array( 
        'width'  => null,
        'height' => null,
    );

    /**
     * Return read-only properties calculating them for the first time if 
     * needed.
     *
     * @throws Exception\PropertyNotFound if the requested property is
     * invalid
     * 
     * @param string $key 
     * @return mixed
     */
    public function __get( $key ) 
    {
        if ( array_key_exists( $key, $this->properties ) === true ) 
        {
            if ( $this->properties[$key] === null ) 
            {
                $this->properties[$key] = $this->calculateProperty( $key );
            }

            return $this->properties[$key];
        }

        throw new Exception\PropertyNotFound( $key, $this );
    }

    /**
     * Set writable properties
     *
     * @throws Exception\PropertyNotFound if the provided property does
     * not exist.
     * @throws Exception\PropertyPermission if the provided property does
     * exist, but is a read-only property
     * 
     * @param string $key 
     * @param mixed $value 
     * @return void
     */
    public function __set( $key, $value ) 
    {
        if ( array_key_exists( $key, $this->properties ) === true ) 
        {
            throw new Exception\PropertyPermission(
                $key,
                Exception\PropertyPermission::READ
            );
        }

        throw new Exception\PropertyNotFound( $key, $this );
    }

    /**
     * Calculate a certain property as it is requested for the first time.
     *
     * The return value will be stored and automatically returned on 
     * consecutive calls to the property access methods.
     * 
     * @param string $key 
     * @return mixed
     */
    protected function calculateProperty( $key ) 
    {
        switch( $key ) 
        {
            case 'width':
                return $this->getWidth();
            case 'height':
                return $this->getHeight();
            default:
                throw new \RuntimeException( "Calculation of a property named '$key' is not defined. This should not happen and seems to be an implementation error." );
        }
    }

    /**
     * Return the width of the stored image data 
     * 
     * @return int
     */
    protected abstract function getWidth();

    /**
     * Return the height of the stored image data 
     * 
     * @return int
     */
    protected abstract function getHeight();
}
