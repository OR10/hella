<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Rectangle extends ExportXml\Element
{
    use ShapeSetting;

    /**
     * @var Shapes\Rectangle
     */
    private $rectangle;

    /**
     * @var string
     */
    private $namespace;

    /**
     * Rectangle constructor.
     *
     * @param Shapes\Rectangle $rectangle
     * @param string           $namespace
     */
    public function __construct(Shapes\Rectangle $rectangle, string $namespace)
    {
        $this->rectangle = $rectangle;
        $this->namespace = $namespace;
    }

    /**
     * @param \DOMDocument $document
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $rectangle = $document->createElementNS($this->namespace, 'rectangle');

        $topLeft = $document->createElementNS($this->namespace, 'top-left');
        $topLeft->setAttribute('x', round($this->rectangle->getLeft(), $this->roundPoint));
        $topLeft->setAttribute('y', round($this->rectangle->getTop(), $this->roundPoint));
        $rectangle->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-right');
        $bottomRight->setAttribute('x', round($this->rectangle->getRight(), $this->roundPoint));
        $bottomRight->setAttribute('y', round($this->rectangle->getBottom(), $this->roundPoint));
        $rectangle->appendChild($bottomRight);

        return $rectangle;
    }
}
