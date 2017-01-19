<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;

class Tags extends ExportXml\Element
{
    public function getElement(\DOMDocument $document)
    {
        $tags = $document->createElement('tags');

        return $tags;
    }
}