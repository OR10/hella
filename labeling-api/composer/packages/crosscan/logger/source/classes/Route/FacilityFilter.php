<?php
class cscntLogFacilityFilter extends cscntLogFilter
{
    /**
     * Facility to check the filtered payloads against.
     *
     * @var string
     */
    protected $facility = null;

    /**
     * Construct a facility filter which outputs the payload to the given
     * writers if the specified facility is identical to the source facility
     * of the checked payload.
     *
     * @param string $facility
     * @param array( string ) $writers
     */
    public function __construct( $facility, $writers )
    {
        parent::__construct( $writers );
        $this->facility = $facility;
    }

    /**
     * Accept or decline a given payload, based on the stored facility
     *
     * @param cscntLogPayload $payload
     * @return boolean
     */
    public function accept( cscntLogPayload $payload )
    {
        return $payload->facility === $this->facility;
    }
}
