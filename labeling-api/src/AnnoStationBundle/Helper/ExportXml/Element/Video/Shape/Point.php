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
        $point->setAttribute('x', $this->point->getPoint()['x']);
        $point->setAttribute('y', $this->point->getPoint()['y']);

        return $point;
    }
}
