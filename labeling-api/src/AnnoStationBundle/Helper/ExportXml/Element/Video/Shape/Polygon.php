<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Polygon extends ExportXml\Element
{
    /**
     * @var Shapes\Polygon
     */
    private $polygon;
    /**
     * @var
     */
    private $namespace;

    public function __construct(Shapes\Polygon $polygon, $namespace)
    {
        $this->polygon   = $polygon;
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $polygon = $document->createElementNS($this->namespace, 'polygon');

        foreach ($this->polygon->getPoints() as $point) {
            $pointElement = $document->createElementNS($this->namespace, 'point');
            $pointElement->setAttribute('x', $point['x']);
            $pointElement->setAttribute('y', $point['y']);
            $polygon->appendChild($pointElement);
        }

        return $polygon;
    }
}