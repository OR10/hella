<?php

namespace AnnoStationBundle\Helper;

use AppBundle\Model;

abstract class ClassesStructure
{
    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return mixed
     */
    abstract public function getLabeledThingInFrameStructure(Model\LabeledThingInFrame $labeledThingInFrame);

    /**
     * Load the given xml as a string or throw an exception on error.
     *
     * @param string $xml
     *
     * @return \DOMDocument
     * @throws \DOMException
     */
    public function loadXmlDocument($xml)
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
}
