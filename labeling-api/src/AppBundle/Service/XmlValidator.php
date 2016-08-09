<?php
namespace AppBundle\Service;

class XmlValidator
{
    /**
     * @var XmlValidator\Schema
     */
    private $schema;

    /**
     * XmlValidator constructor.
     * @param XmlValidator\Schema $schema
     */
    public function __construct(XmlValidator\Schema $schema)
    {
        $this->schema = $schema;
    }

    /**
     * Check if the XML Document is valid
     *
     * @param \DOMDocument $xmlDocument
     * @return bool
     */
    public function isXmlValid(\DOMDocument $xmlDocument)
    {
        libxml_use_internal_errors(true);
        $isValid = $xmlDocument->schemaValidate($this->schema->getSchemaFileName());
        libxml_clear_errors();

        return $isValid;
    }
}