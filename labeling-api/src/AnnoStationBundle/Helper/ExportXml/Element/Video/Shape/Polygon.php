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

    public function __construct(Shapes\Polygon $polygon)
    {
        $this->polygon = $polygon;
    }

    public function getElement(\DOMDocument $document)
    {
        $polygon = $document->createElement('polygon');

        foreach ($this->polygon->getPoints() as $point) {
            $pointElement = $document->createElement('point');
            $pointElement->setAttribute('x', $point['x']);
            $pointElement->setAttribute('y', $point['y']);
            $polygon->appendChild($pointElement);
        }

        return $polygon;
    }
}