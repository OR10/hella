<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Metadata;

use AnnoStationBundle\Helper\ExportXml;

class AnnoStation extends ExportXml\Element
{
    /**
     * @var string
     */
    private $hostname;

    /**
     * @var int
     */
    private $build;

    /**
     * @var string
     */
    private $namespace;

    public function __construct($hostname = 'unknown', $build = 0, $namespace)
    {
        $this->hostname  = $hostname;
        $this->build     = $build;
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $annostation = $document->createElementNS($this->namespace, 'annostation');

        $hostname = $document->createElementNS($this->namespace, 'hostname', $this->hostname);
        $build    = $document->createElementNS($this->namespace, 'build', $this->build);

        $annostation->appendChild($hostname);
        $annostation->appendChild($build);

        return $annostation;
    }
}