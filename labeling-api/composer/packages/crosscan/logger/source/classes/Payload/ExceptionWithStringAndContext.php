<?php
namespace crosscan\Logger\Payload;

class ExceptionWithStringAndContext extends \cscntLogExceptionPayload implements \cscntLogHierarchicalArrayStructProducer
{
    /**
     * @var string
     */
    private $string;

    /**
     * @var array
     */
    private $context;

    public function __construct($severity, $facililty, $id, \Exception $exception, $string, array $context)
    {
        parent::__construct($severity, $facililty, $id, $exception);
        $this->string  = $string;
        $this->context = $context;
    }

    public function __toString()
    {
        return $this->string . ' - ' . parent::__toString();
    }

    public function toHierarchicalArrayStruct()
    {
        $exceptionData = parent::toHierarchicalArrayStruct();

        $exceptionData['context']       = $this->context;
        $exceptionData['messageString'] = $this->string;

        return $exceptionData;
    }
}
