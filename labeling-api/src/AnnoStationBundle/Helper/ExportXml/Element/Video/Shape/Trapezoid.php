<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Trapezoid extends ExportXml\Element
{
    /**
     * @var Shapes\Trapezoid
     */
    private $trapezoid;

    /**
     * @var string
     */
    private $namespace;

    public function __construct(Shapes\Trapezoid $rectangle, $namespace)
    {
        $this->trapezoid = $rectangle;
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $trapezoid = $document->createElementNS($this->namespace, 'trapezoid');

        $topLeft = $document->createElementNS($this->namespace, 'top-left');
        $topLeft->setAttribute('x', $this->trapezoid->getLeft());
        $topLeft->setAttribute('y', $this->trapezoid->getTop());
        $trapezoid->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-right');
        $bottomRight->setAttribute('x', $this->trapezoid->getRight());
        $bottomRight->setAttribute('y', $this->trapezoid->getBottom());
        $trapezoid->appendChild($bottomRight);

        //if trapezoid
        if ($this->trapezoid->getTrapezoidType() == 'trapezoid') {
            $bottomRight = $document->createElementNS($this->namespace, 'handle-top');
            $bottomRight->setAttribute('x', $this->trapezoid->getHandleLeft());
            $bottomRight->setAttribute('y', $this->trapezoid->getHandleTop());
            $trapezoid->appendChild($bottomRight);

            $bottomRight = $document->createElementNS($this->namespace, 'handle-bottom');
            $bottomRight->setAttribute('x', $this->trapezoid->getHandleRight());
            $bottomRight->setAttribute('y', $this->trapezoid->getHandleBottom());
            $trapezoid->appendChild($bottomRight);
        }

        return $trapezoid;
    }
}
