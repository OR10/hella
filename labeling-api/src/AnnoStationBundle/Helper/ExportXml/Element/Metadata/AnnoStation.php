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

    public function __construct($hostname = 'unknown', $build = 0)
    {
        $this->hostname = $hostname;
        $this->build    = $build;
    }

    public function getElement(\DOMDocument $document)
    {
        $annostation = $document->createElement('annostation');

        $hostname = $document->createElement('hostname', $this->hostname);
        $build    = $document->createElement('build', $this->build);

        $annostation->appendChild($hostname);
        $annostation->appendChild($build);

        return $annostation;
    }
}