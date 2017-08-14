<?php
interface cscntLogFileProducer
{
    /**
     * Produce a file log object for consumation by a log writer
     *
     * @return cscntLogFileStruct
     */
    public function toFile();
}
