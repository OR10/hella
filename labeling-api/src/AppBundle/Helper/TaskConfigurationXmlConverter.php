<?php

namespace AppBundle\Helper;

use AppBundle\Model;

class TaskConfigurationXmlConverter
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
        /**
         * Inline Error handler, which would otherwise be a public method on the class
         *
         * @param $errno
         * @param $errstr
         * @param $errfile
         * @param $errline
         *
         * @return bool
         * @throws \DOMException
         */
        $errorHandler = function ($errno, $errstr, $errfile, $errline) {
            if (
                $errno === E_WARNING &&
                strpos($errstr, "DOMDocument::loadXML()") != -1
            ) {
                throw new \DOMException($errstr);
            }

            return false;
        };

        set_error_handler($errorHandler);
        $document = new \DOMDocument();
        $document->loadXML($xml, LIBXML_COMPACT | LIBXML_NONET);
        restore_error_handler();

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

    /**
     * Retrieve a `labelStructure` like array definition of the xml configuration
     *
     * The returned structure can be easily serialized with json_encode.
     */
    public function getLabelStructure()
    {
        $rootStructure = array(
            'name'     => 'root',
            'children' => array(),
        );

        $xpath = new \DOMXPath($this->document);

        foreach ($xpath->query('class') as $classNode) {
            $classStructure = array(
                'name'     => $classNode->getAttribute('id'),
                'children' => array(),
            );

            foreach ($xpath->query('value', $classNode) as $valueNode) {
                $valueStructure               = array(
                    'name' => $valueNode->getAttribute('id'),
                );
                $classStructure['children'][] = $valueStructure;
            }

            $rootStructure['children'][] = $classStructure;
        }

        return $rootStructure;
    }

    /**
     * Retrieve a `labelStructureUi` like array definition of the xml configuration
     *
     * The returned structure can be easily serialized with json_encode.
     */
    public function getLabelStructureUi()
    {
        $uiStructure = array();

        $xpath = new \DOMXPath($this->document);

        foreach($xpath->query('class') as $classNode) {
            $uiStructure[$classNode->getAttribute('id')] = array('challenge' => $classNode->getAttribute('name'));
        }

        foreach($xpath->query('class/value') as $valueNode) {
            $uiStructure[$valueNode->getAttribute('id')] = array('response' => $valueNode->getAttribute('name'));
        }

        return $uiStructure;
    }
}