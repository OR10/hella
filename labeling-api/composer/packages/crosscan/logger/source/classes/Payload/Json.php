<?php
class cscntLogJsonPayload extends cscntLogPayload implements cscntLogHierarchicalArrayStructProducer
{
    /**
     * JSON document to be transported through the logger subsystem
     *
     * @var StdClass
     */
    protected $document = null;

    /**
     * Construct a JsonPayload taking the usual severity, facility and id
     * information as well as either a json document encoded as a string or as
     * and StdClass.
     *
     * @param int $severity
     * @param string $facility
     * @param string $id
     * @param string|StdClass $document
     */
    public function __construct( $severity, $facility, $id, $document )
    {
        parent::__construct( $severity, $facility, $id );

        if ( is_string( $document ) )
        {
            if ( ( $document = json_decode( $document ) ) === null )
            {
                throw new cscntInvalidJsonException( $document );
            }
        }

        $this->document = $document;
    }

    /**
     * Create a StdClass JSON representation of the provided JSON data
     *
     * @return array
     */
    public function toHierarchicalArrayStruct()
    {
        return (array) $this->document;
    }

    /**
     * Produce a string version of the JSON document.
     *
     * @TODO: Decide wether the json encoded document should be logged here, or
     * a simple information string. For now a truncated version of the json
     * document is logged.
     *
     * @return string
     */
    public function __toString()
    {
        $json = json_encode( $this->document );

        if ( strlen( $json ) >= 73 )
        {
            return substr( $json, 0, 72 ) . '…';
        }

        return $json;
    }

    /**
     * Return the prioritized order in which the implemented producers are
     * used.
     *
     * @return array( string )
     */
    public function getProducerPriority()
    {
        return array(
            'HierarchicalArrayStruct',
            'String'
        );
    }
}
