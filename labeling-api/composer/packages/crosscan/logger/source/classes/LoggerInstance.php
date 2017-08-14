<?php
class cscntLoggerInstance
{
    protected static $instance = null;

    /**
     * Retrieve the currently stored cscntLogger
     *
     * If no logger is stored a cscntLoggerInstanceNotAvailableException is
     * thrown.
     *
     * @return cscntLogger
     */
    public static function get()
    {
        if ( self::$instance === null )
        {
            throw new cscntLoggerInstanceNotAvailableException();
        }

        return self::$instance;
    }

    /**
     * Set the cscntLogger instance to be used for later on retrieval by any
     * part of the application.
     *
     * @param cscntLogger $logger
     * @return void
     */
    public static function set( cscntLogger $logger )
    {
        self::$instance = $logger;
    }

    /**
     * Remove the currently stored cscntLogger instance and clear the
     * instance cache
     *
     * @return void
     */
    public static function reset()
    {
        self::$instance = null;
    }
}
