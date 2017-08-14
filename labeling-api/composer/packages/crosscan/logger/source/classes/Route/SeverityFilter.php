<?php
class cscntLogSeverityFilter extends cscntLogFilter
{
    /**
     * Threshold of the severity from which onwards payloads should be logged
     *
     * @var int
     */
    protected $severityThreshold = null;

    /**
     * Construct a severity filter which outputs the payload to the given
     * writers if the specified severity is reached by the payload.
     *
     * @param int $severity
     * @param array( string ) $writers
     */
    public function __construct( $severity, $writers )
    {
        parent::__construct( $writers );
        $this->severityThreshold = $severity;
    }

    /**
     * Accept or decline a given payload, based on the stored severity
     * threshold.
     *
     * @param cscntLogPayload $payload
     * @return boolean
     */
    protected function accept( cscntLogPayload $payload )
    {
        return $payload->severity >= $this->severityThreshold;
    }
}
