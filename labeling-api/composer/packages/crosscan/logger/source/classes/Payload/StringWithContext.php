<?php

namespace crosscan\Logger\Payload;

class StringWithContext extends \cscntLogStringPayload implements \cscntLogHierarchicalArrayStructProducer
{
    /**
     * @var array
     */
    private $context;

    public function __construct($severity, $facility, $id, $string, array $context)
    {
        parent::__construct($severity, $facility, $id, $string);
        $this->context = $context;
    }

    public function getProducerPriority()
    {
        return array(
            'HierarchicalArrayStruct',
            'String',
        );
    }

    public function toHierarchicalArrayStruct()
    {
        $document = array();

        $document['logPayloadType']     = 'StringWithContext';
        $document['fullMessage']        = (string) $this;
        $document['contextInformation'] = $this->context;

        return $document;
    }
}
