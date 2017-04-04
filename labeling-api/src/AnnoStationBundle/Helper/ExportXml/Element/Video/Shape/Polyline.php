<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Polyline extends ExportXml\Element
{
    /**
     * @var Shapes\Polyline
     */
    private $polyline;
    /**
     * @var
     */
    private $namespace;

    public function __construct(Shapes\Polyline $polyline, $namespace)
    {
        $this->polyline  = $polyline;
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $polyline = $document->createElementNS($this->namespace, 'polyline');

        foreach ($this->polyline->getPoints() as $point) {
            $pointElement = $document->createElementNS($this->namespace, 'point');
            $pointElement->setAttribute('x', $point['x']);
            $pointElement->setAttribute('y', $point['y']);
            $polyline->appendChild($pointElement);
        }

        return $polyline;
    }
}
