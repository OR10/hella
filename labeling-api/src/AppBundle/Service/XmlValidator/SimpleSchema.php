<?php

namespace AppBundle\Service\XmlValidator;

/**
 * Class SimpleSchema
 * @package AppBundle\Service\XmlValidator
 */
class SimpleSchema implements Schema
{

    /**
     * @var string
     */
    private $schema;

    /**
     * SimpleSchema constructor.
     *
     * @param string $schema
     */
    public function __construct(string $schema)
    {
        $this->schema = $schema;
    }

    /**
     * @return string
     */
    public function getSchema()
    {
        return $this->schema;
    }
}
