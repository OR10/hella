<?php

class cscntLogGroupWriterMock extends cscntLogWriter
{
    public $setGroupMocked = array();

    public function fromString( $severity, $facility, $id, $logData )
    {
    }

    public function setGroup( $uuid )
    {
        $this->setGroupMocked[] = $uuid;
    }
}
