<?php
namespace AnnoStationBundle\Helper;

abstract class TaskConfigurationXmlConverter
{
    /**
     * TaskConfigurationXmlConverter constructor.
     *
     * @param string $xml
     */
    public function __construct($xml)
    {
        $this->document = $this->loadXmlDocument($xml);
    }

    /**
     * Load the given xml as a string or throw an exception on error.
     *
     * @param string $xml
     *
     * @return \DOMDocument
     * @throws \DOMException
     */
    private function loadXmlDocument($xml)
    {
        $document = new \DOMDocument();
        if (!$document->loadXML($xml, LIBXML_COMPACT | LIBXML_NONET)) {
            $error = libxml_get_last_error();
            throw new \DOMException($error->message);
        }

        return $document;
    }

    /**
     * @param int    $errno
     * @param string $errstr
     * @param string $errfile
     * @param int    $errline
     *
     * @return bool
     * @throws \DOMException
     */
    public function handleXmlLoadError($errno, $errstr, $errfile, $errline)
    {
        if (
            $errno === E_WARNING &&
            strpos($errstr, "DOMDocument::loadXML()") != -1
        ) {
            throw new \DOMException($errstr);
        }

        return false;
    }
}
