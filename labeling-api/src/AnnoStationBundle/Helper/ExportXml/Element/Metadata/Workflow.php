<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;

class Workflow extends ExportXml\Element
{
    /**
     * @var string
     */
    private $namespace;

    public function __construct($namespace)
    {
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $workflow = $document->createElementNS($this->namespace, 'workflow');

        return $workflow;
    }
}
