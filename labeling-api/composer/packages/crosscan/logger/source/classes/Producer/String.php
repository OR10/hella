<?php
interface cscntLogStringProducer
{
/**
     * Return the payload as a string representation.
     *
     * This is the default output every payload has to provide. As strings are
     * the bare minimum any writers needs to be capable of logging.
     *
     * @return string
     */
    public function __toString();
}
