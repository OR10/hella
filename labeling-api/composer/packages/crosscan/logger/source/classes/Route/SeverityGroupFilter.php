<?php
/**
 * Filter which checks a minimum severity of a group of payloads. If one of the
 * payloads inside the group meets the requirements all payloads are logged.
 */
class cscntLogSeverityGroupFilter extends cscntLogSeverityFilter
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
     * Construct a severity filter which outputs the payload to the given
     * writers if the specified severity is reached by the payload.
     *
     * @param int $severity
     * @param array( string ) $writers
     */
    public function __construct( $severity, $writers )
    {
        parent::__construct( $severity, $writers );
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
