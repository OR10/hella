<?php
use crosscan\Std;

abstract class cscntLogWriter implements cscntLogStringConsumer
{
    /**
     * Set the unique identifier of the group of log messages to be processed
     * next.
     *
     * Every log payload processed after a call to this method does belong to
     * the given uuid.
     *
     * @param string $uuid
     *
     * @return void
     */
    public abstract function setGroup( $uuid );
}
