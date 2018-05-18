<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Point extends ExportXml\Element
{
    use ShapeSetting;

    /**
     * @var Shapes\Point
     */
    private $point;

    /**
     * @var
     */
    private $namespace;

    /**
     * Point constructor.
     *
     * @param Shapes\Point $point
     * @param string       $namespace
     */
    public function __construct(Shapes\Point $point, string $namespace)
    {
        $this->point   = $point;
        $this->namespace = $namespace;
    }

    /**
     * @param \DOMDocument $document
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $point = $document->createElementNS($this->namespace, 'point');

        $center = $document->createElementNS($this->namespace, 'center');
        $center->setAttribute('x', round($this->point->getPoint()['x'], $this->roundPoint));
        $center->setAttribute('y', round($this->point->getPoint()['y'], $this->roundPoint));
        $point->appendChild($center);

        return $point;
    }
}
