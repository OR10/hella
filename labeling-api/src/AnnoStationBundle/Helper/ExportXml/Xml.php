<?php

namespace AnnoStationBundle\Helper\ExportXml;

class Xml
{
    /**
     * @var \DOMDocument
     */
    private $document;

    /**
     * @var \DOMElement
     */
    private $export;

    public function __construct()
    {
        $this->document = new \DOMDocument('1.0', "UTF-8");
        $this->export   = $this->document->createElementNS('http://weblabel.hella-aglaia.com/schema/export', 'export');
    }

    /**
     * @return \DOMDocument
     */
    public function getDocument()
    {
        $this->document->formatOutput = true;

        return $this->document;
    }

    /**
     * @param $child
     */
    public function appendChild($child)
    {
        $this->export->appendChild($child);
        $this->document->appendChild($this->export);
    }
}