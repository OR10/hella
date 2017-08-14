<?php
use crosscan\Std;

/**
 * Simple log writer to stream log to STDERR for errors and diagnostics
 */
class cscntLogStderrWriter extends cscntLogFileWriter
{

    /**
     * Construct a new Stderr Writer taking with STDERR as output target.
     */
    public function __construct( )
    {
        $this->handle = fopen( 'php://stderr', "w" );
    }

}
