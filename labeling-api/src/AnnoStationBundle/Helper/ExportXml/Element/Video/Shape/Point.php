<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Point extends ExportXml\Element
{
    /**
     * @var Shapes\Point
     */
    private $point;
    /**
     * @var
     */
    private $namespace;

    public function __construct(Shapes\Point $point, $namespace)
    {
        $this->point   = $point;
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $point = $document->createElementNS($this->namespace, 'point');

        $center = $document->createElementNS($this->namespace, 'center');
        $center->setAttribute('x', $this->point->getPoint()['x']);
        $center->setAttribute('y', $this->point->getPoint()['y']);
        $point->appendChild($center);

        return $point;
    }
}
