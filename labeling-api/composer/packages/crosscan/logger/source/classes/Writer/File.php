<?php

use crosscan\Std;

/**
 * Simple syslog compatible file based string consuming writer
 */
class cscntLogFileWriter extends cscntLogWriter
{
    /**
     * File handle to be used for output of log messages
     *
     * @var resource
     */
    protected $handle = null;

    /**
     * Currently active groupId
     *
     * @var string
     */
    protected $group = null;

    /**
     * Construct a new FileWriter taking the given file as output target.
     *
     * If the given file does already exist data will be appended to it. If it
     * does not exist it will be created.
     *
     * @param string $filename
     * @throws cscntPropertyPermissionException
     */
    public function __construct( $filename )
    {
        if ( ( file_exists( $filename ) !== true && touch( $filename ) === false )
          || ( file_exists( $filename ) === true && is_writable( $filename ) !== true ) )
        {
            throw new cscntPropertyPermissionException(
                $filename,
                cscntPropertyPermissionException::WRITE
            );
        }

        $this->handle = fopen( $filename, "a" );
    }

    /**
     * Set the group UUID, which should be used from now on for logging
     * messages
     *
     * @var string
     */
    public function setGroup( $uuid )
    {
        $this->group = $uuid;
    }

    /**
     * Create a syslog compatible output based on the given string
     * representation of the logged payload and write it to the log file.
     *
     * @param int $severity
     * @param string $facility
     * @param string|null $id
     * @param string $message
     * @return void
     */
    public function fromString( $severity, $facility, $id, $message )
    {
        $now = new DateTime();

        fwrite(
            $this->handle,
            sprintf(
                "%s <%s> [%s] %s: %s\n",
                $now->format( "M d H:i:s" ),
                cscntLogPayload::getTextualSeverity( $severity ),
                (isset($this->group) ? $this->group : 'UNKNOWN REQ ID'),
                $facility,
                $message
            )
        );

        // Make sure the written data is flushed to the disk.
        fflush( $this->handle );
    }
}
