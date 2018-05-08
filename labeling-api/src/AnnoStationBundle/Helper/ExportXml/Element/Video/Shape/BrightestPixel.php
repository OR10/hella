<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class BrightestPixel extends ExportXml\Element
{
    /**
     * @var Shapes\BrightestPixel
     */
    private $brightestPixel;

    /**
     * @string
     */
    private $namespace;

    public function __construct(Shapes\BrightestPixel $brightestPixel, $namespace)
    {
        $this->brightestPixel = $brightestPixel;
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $pixel = $document->createElementNS($this->namespace, 'lsr-pixel');

        $topLeft = $document->createElementNS($this->namespace, 'lsr-roi-top-left');
        $topLeft->setAttribute('x', $this->brightestPixel->getLeft());
        $topLeft->setAttribute('y', $this->brightestPixel->getTop());
        $pixel->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'lsr-roi-bottom-right');
        $bottomRight->setAttribute('x', $this->brightestPixel->getRight());
        $bottomRight->setAttribute('y', $this->brightestPixel->getBottom());
        $pixel->appendChild($bottomRight);

        $center = $document->createElementNS($this->namespace, 'lsr-pixel-position');
        $center->setAttribute('x', $this->brightestPixel->getPoint()['x']);
        $center->setAttribute('y', $this->brightestPixel->getPoint()['y']);
        $pixel->appendChild($center);
        return $pixel;
    }
}