<?php
class cscntLogStringPayload extends cscntLogPayload
{
    /**
     * String to be transported through the logger subsystem
     *
     * @var string
     */
    protected $string;

    public function __construct( $severity, $facility, $id, $string )
    {
        parent::__construct( $severity, $facility, $id );
        switch( true )
        {
            case is_null( $string ):
                $this->string = "null";
            break;
            case $string === true:
                $this->string = "true";
            break;
            case $string === false:
                $this->string = "false";
            break;
            default:
                $this->string = (string)$string;
        }
    }

    /**
     * Create a string representation of this payload
     */
    public function __toString()
    {
        return $this->string;
    }
}
