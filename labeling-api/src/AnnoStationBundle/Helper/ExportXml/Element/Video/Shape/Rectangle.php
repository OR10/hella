<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Rectangle extends ExportXml\Element
{
    /**
     * @var Shapes\Rectangle
     */
    private $rectangle;

    /**
     * @var string
     */
    private $namespace;

    public function __construct(Shapes\Rectangle $rectangle, $namespace)
    {
        $this->rectangle = $rectangle;
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $rectangle = $document->createElementNS($this->namespace, 'rectangle');

        $topLeft = $document->createElementNS($this->namespace, 'top-left');
        $topLeft->setAttribute('x', $this->rectangle->getLeft());
        $topLeft->setAttribute('y', $this->rectangle->getTop());
        $rectangle->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom_right');
        $bottomRight->setAttribute('x', $this->rectangle->getRight());
        $bottomRight->setAttribute('y', $this->rectangle->getBottom());
        $rectangle->appendChild($bottomRight);

        return $rectangle;
    }
}