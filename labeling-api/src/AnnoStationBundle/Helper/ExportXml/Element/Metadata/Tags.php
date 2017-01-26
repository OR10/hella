<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;

class Tags extends ExportXml\Element
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
        $tags = $document->createElementNS($this->namespace, 'tags');

        return $tags;
    }
}
