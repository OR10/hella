<?php
interface cscntLogFileConsumer
{
    /**
     * Write the file binary data based payload
     *
     * @param mixed $severity
     * @param mixed $facility
     * @param mixed $id
     * @param cscntLogFileStruct $file
     * @return void
     */
    public function fromFile($severity, $facility, $id, cscntLogFileStruct $file);
}
