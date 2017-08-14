<?php
/**
 * Collection of LogWriter objects
 *
 * Only named writers may be stored
 */
class cscntLogWriterCollection extends cscntLogCollection
{
    /**
     * Set the given key value information.
     *
     * Only accept named values
     *
     * @throws cscntLogUniqueNameRequiredException if no name is provided
     *
     * @param string $key
     * @param cscntLogWriter $value
     * @return void
     */
    public function __set( $key, $value )
    {
        if ( $key === null )
        {
            throw new cscntLogUniqueNameRequiredException();
        }

        $this->properties[$key] = $value;
    }
}
