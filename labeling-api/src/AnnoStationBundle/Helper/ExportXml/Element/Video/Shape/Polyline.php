<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Polyline extends ExportXml\Element
{
    use ShapeSetting;

    /**
     * @var Shapes\Polyline
     */
    private $polyline;
    /**
     * @var
     */
    private $namespace;

    /**
     * Polyline constructor.
     *
     * @param Shapes\Polyline $polyline
     * @param string          $namespace
     */
    public function __construct(Shapes\Polyline $polyline, string $namespace)
    {
        $this->polyline  = $polyline;
        $this->namespace = $namespace;
    }

    /**
     * @param \DOMDocument $document
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $polyline = $document->createElementNS($this->namespace, 'polyline');

        foreach ($this->polyline->getPoints() as $point) {
            $pointElement = $document->createElementNS($this->namespace, 'point');
            $pointElement->setAttribute('x', round($point['x'], $this->roundPoint));
            $pointElement->setAttribute('y', round($point['y'], $this->roundPoint));
            $polyline->appendChild($pointElement);
        }

        return $polyline;
    }
}
