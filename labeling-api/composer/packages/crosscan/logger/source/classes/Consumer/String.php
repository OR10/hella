<?php
interface cscntLogStringConsumer
{
    /**
     * Write a string based payload
     *
     * @param mixed $severity
     * @param mixed $facility
     * @param mixed $id
     * @param mixed $logData
     * @return void
     */
    public function fromString( $severity, $facility, $id, $logData );
}
