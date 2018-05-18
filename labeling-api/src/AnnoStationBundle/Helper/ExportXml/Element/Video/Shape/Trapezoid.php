<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Trapezoid extends ExportXml\Element
{
    use ShapeSetting;

    /**
     * @var Shapes\Trapezoid
     */
    private $trapezoid;

    /**
     * @var string
     */
    private $namespace;

    /**
     * Trapezoid constructor.
     *
     * @param Shapes\Trapezoid $rectangle
     * @param                  $namespace
     */
    public function __construct(Shapes\Trapezoid $rectangle, $namespace)
    {
        $this->trapezoid = $rectangle;
        $this->namespace = $namespace;
    }

    /**
     * @param \DOMDocument $document
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $trapezoid = $document->createElementNS($this->namespace, 'trapezoid');

        $topLeft = $document->createElementNS($this->namespace, 'top-left');
        $topLeft->setAttribute('x', round($this->trapezoid->getLeft(), $this->roundPoint));
        $topLeft->setAttribute('y', round($this->trapezoid->getTop(), $this->roundPoint));
        $trapezoid->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-right');
        $bottomRight->setAttribute('x', round($this->trapezoid->getRight(), $this->roundPoint));
        $bottomRight->setAttribute('y', round($this->trapezoid->getBottom(), $this->roundPoint));
        $trapezoid->appendChild($bottomRight);

        //if trapezoid
        if ($this->trapezoid->isTrapezoid()) {
            $bottomRight = $document->createElementNS($this->namespace, 'handle-top');
            $bottomRight->setAttribute('x', round($this->trapezoid->getHandleLeft(), $this->roundPoint));
            $bottomRight->setAttribute('y', round($this->trapezoid->getHandleTop(), $this->roundPoint));
            $trapezoid->appendChild($bottomRight);

            $bottomRight = $document->createElementNS($this->namespace, 'handle-bottom');
            $bottomRight->setAttribute('x', round($this->trapezoid->getHandleRight(), $this->roundPoint));
            $bottomRight->setAttribute('y', round($this->trapezoid->getHandleBottom(), $this->roundPoint));
            $trapezoid->appendChild($bottomRight);
        }

        return $trapezoid;
    }
}
