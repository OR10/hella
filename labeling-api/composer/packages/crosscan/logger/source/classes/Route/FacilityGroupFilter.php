<?php
/**
 * Filter which checks if at least one of certain group of payloads originates
 * from a certain facility
 */
class cscntLogFacilityGroupFilter extends cscntLogFacilityFilter
{

    /**
     * Wheather or not the requirements have been met during this or any before
     * made routing run.
     *
     * @var bool
     */
    protected $requirementsMet = false;

    /**
     * Payloads buffered for output as soon as the requirements are met.
     *
     * @var array
     */
    protected $bufferedPayloads;

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
        parent::__construct( $facility, $writers );
        $this->bufferedPayloads = array();
    }

    /**
     * Accept or decline payloads based on already seen payloads and their own
     * information
     *
     * @param cscntLogPayload $payload
     * @return boolean
     */
    public function accept( cscntLogPayload $payload )
    {
        // First of all buffer the payload, as the filter may be met in a later
        // on routing stage.
        $this->bufferedPayloads[] = $payload;

        $this->updateMetRequirements( $payload );

        if ( $this->requirementsMet === true )
        {
            $buffer = $this->bufferedPayloads;
            $this->bufferedPayloads = array();
            return $buffer;
        }

        return false;
    }

    /**
     * Analyse the given payload and update the met requirements flag according
     * to the new information
     *
     * @param cscntLogPayload $payload
     * @return void
     */
    protected function updateMetRequirements( cscntLogPayload $payload )
    {
        if ( parent::accept( $payload ) === true )
        {
            $this->requirementsMet = true;
        }
    }
}
