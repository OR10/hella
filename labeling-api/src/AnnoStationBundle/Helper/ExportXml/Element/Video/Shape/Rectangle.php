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

    public function __construct(Shapes\Rectangle $rectangle)
    {
        $this->rectangle = $rectangle;
    }

    public function getElement(\DOMDocument $document)
    {
        $rectangle = $document->createElement('rectangle');

        $topLeft = $document->createElement('top-left');
        $topLeft->setAttribute('x', $this->rectangle->getLeft());
        $topLeft->setAttribute('y', $this->rectangle->getTop());
        $rectangle->appendChild($topLeft);

        $bottomRight = $document->createElement('bottom_right');
        $bottomRight->setAttribute('x', $this->rectangle->getRight());
        $bottomRight->setAttribute('y', $this->rectangle->getBottom());
        $rectangle->appendChild($bottomRight);

        return $rectangle;
    }
}