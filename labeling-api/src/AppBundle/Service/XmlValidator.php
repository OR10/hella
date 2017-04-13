<?php
namespace AppBundle\Service;

/**
 * Class XmlValidator
 * @package AppBundle\Service
 */
class XmlValidator
{
    /**
     * @var XmlValidator\Schema
     */
    private $schema;

    /**
     * XmlValidator constructor.
     *
     * @param XmlValidator\Schema $schema
     */
    public function __construct(XmlValidator\Schema $schema)
    {
        $this->schema = $schema;
    }

    /**
     * @param \DOMDocument $xmlDocument
     *
     * @return null|string
     */
    public function validate(\DOMDocument $xmlDocument)
    {
        libxml_use_internal_errors(true);
        if (!$xmlDocument->schemaValidateSource($this->schema->getSchema())) {
            return $this->libxmlDisplayErrors();
        }

        return null;
    }

    /**
     * @param \DOMDocument $xmlDocument
     *
     * @return null|string
     */
    public function validateRelaxNg(\DOMDocument $xmlDocument)
    {
        libxml_use_internal_errors(true);
        if (!$xmlDocument->relaxNGValidateSource($this->schema->getSchema())) {
            return $this->libxmlDisplayErrors();
        }

        return null;
    }

    /**
     * Check if the XML Document is valid
     *
     * @param \DOMDocument $xmlDocument
     *
     * @return bool
     */
    public function isXmlValid(\DOMDocument $xmlDocument)
    {
        libxml_use_internal_errors(true);
        $isValid = $xmlDocument->schemaValidateSource($this->schema->getSchema());
        libxml_clear_errors();

        return $isValid;
    }

    /**
     * Return fancy errors messages
     *
     * @param $error
     *
     * @return string
     */
    private function libxmlDisplayError($error)
    {
        switch ($error->level) {
            case LIBXML_ERR_WARNING:
                $return = 'Warning ' . $error->code . ': ';
                break;
            case LIBXML_ERR_ERROR:
                $return = 'Error ' . $error->code . ': ';
                break;
            case LIBXML_ERR_FATAL:
                $return = 'Fatal Error ' . $error->code . ': ';
                break;
            default:
                $return = 'Unknown Error: ';
        }
        $return .= trim($error->message);
        $return .= ' on line ' . $error->line;

        return $return;
    }

    /**
     * @return string
     */
    private function libxmlDisplayErrors()
    {
        $errors = libxml_get_errors();
        foreach ($errors as $error) {
            return $this->libxmlDisplayError($error);
        }
        libxml_clear_errors();
    }
}
