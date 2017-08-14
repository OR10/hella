<?php
/**
 * Payload to transport arbitrary Exceptions through the logger ecosystem.
 */
class cscntLogExceptionPayload extends cscntLogPayload
    implements cscntLogHierarchicalArrayStructProducer
{
    /**
     * Raw Exception to be logged
     *
     * @var Exception
     */
    protected $exception;

    /**
     * Construct an ExceptionPayload based on the usual information like
     * severity, facililty, id as well as the Exception to be transported
     * itself.
     *
     * @param int $severity
     * @param string $facililty
     * @param string $id
     * @param Exception $exception
     */
    public function __construct( $severity, $facililty, $id, $exception )
    {
        parent::__construct( $severity, $facililty, $id );

        $this->exception = $exception;
    }

    /**
     * Create a array representation of this payload and return it.
     *
     * @return array
     */
    public function toHierarchicalArrayStruct()
    {
        return $this->createExceptionArray(
            $this->exception
        );
    }

    /**
     * Create a string representation of this log payload and return it.
     *
     * @return string
     */
    public function __toString()
    {
        return sprintf(
            "%s thrown in %s(%d): %s\n%s",
            get_class( $this->exception ),
            $this->exception->getFile(),
            $this->exception->getLine(),
            $this->exception->getMessage(),
            $this->exception->getTraceAsString()
        );
    }

    /**
     * Provide the priorities which are used to consume the provided types of
     * information.
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


    /**
     * Create and return an array structure containing all the relevant
     * information from the given exception.
     *
     * If the Exception has got a chained exception included this one will be
     * handled recursively and being attached.
     *
     * @param Exception $exception
     * @return array
     */
    protected function createExceptionArray( $exception )
    {
        $document = array();
        $document['logPayloadType'] = 'Exception';
        $document['exceptionClass'] = get_class( $exception );
        $document['message']        = $exception->getMessage();
        $document['code']           = $exception->getCode();
        $document['file']           = $exception->getFile();
        $document['line']           = $exception->getLine();
        $document['stackTrace']     = $exception->getTrace();
        $document['fullMessage']    = (string) $this;

        if ( $exception->getPrevious() !== null )
        {
            $document['previous'] = $this->createExceptionArray(
                $exception->getPrevious()
            );
        }

        return $document;
    }
}
