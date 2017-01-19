<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;

class Workflow extends ExportXml\Element
{
    public function getElement(\DOMDocument $document)
    {
        $workflow = $document->createElement('workflow');

        return $workflow;
    }
}