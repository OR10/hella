<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Polygon extends ExportXml\Element
{
    use ShapeSetting;

    /**
     * @var Shapes\Polygon
     */
    private $polygon;
    /**
     * @var
     */
    private $namespace;

    /**
     * Polygon constructor.
     * @param Shapes\Polygon $polygon
     * @param string         $namespace
     */
    public function __construct(Shapes\Polygon $polygon, string $namespace)
    {
        $this->polygon   = $polygon;
        $this->namespace = $namespace;
    }

    /**
     * @param \DOMDocument $document
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $polygon = $document->createElementNS($this->namespace, 'polygon');

        foreach ($this->polygon->getPoints() as $point) {
            $pointElement = $document->createElementNS($this->namespace, 'point');
            $pointElement->setAttribute('x', round($point['x'], $this->roundPoint));
            $pointElement->setAttribute('y', round($point['y'], $this->roundPoint));
            $polygon->appendChild($pointElement);
        }

        return $polygon;
    }
}
