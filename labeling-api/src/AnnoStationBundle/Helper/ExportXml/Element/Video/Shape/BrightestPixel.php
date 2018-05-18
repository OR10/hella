<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class BrightestPixel extends ExportXml\Element
{
    use ShapeSetting;

    /**
     * @var Shapes\BrightestPixel
     */
    private $brightestPixel;

    /**
     * @string
     */
    private $namespace;

    /**
     * BrightestPixel constructor.
     *
     * @param Shapes\BrightestPixel $brightestPixel
     * @param string                $namespace
     */
    public function __construct(Shapes\BrightestPixel $brightestPixel, string $namespace)
    {
        $this->brightestPixel = $brightestPixel;
        $this->namespace = $namespace;
    }

    /**
     * @param \DOMDocument $document
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $pixel = $document->createElementNS($this->namespace, 'lsr-pixel');

        $topLeft = $document->createElementNS($this->namespace, 'lsr-roi-top-left');
        $topLeft->setAttribute('x', round($this->brightestPixel->getLeft(), $this->roundPoint));
        $topLeft->setAttribute('y', round($this->brightestPixel->getTop(), $this->roundPoint));
        $pixel->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'lsr-roi-bottom-right');
        $bottomRight->setAttribute('x', round($this->brightestPixel->getRight(), $this->roundPoint));
        $bottomRight->setAttribute('y', round($this->brightestPixel->getBottom(), $this->roundPoint));
        $pixel->appendChild($bottomRight);

        $center = $document->createElementNS($this->namespace, 'lsr-pixel-position');
        $center->setAttribute('x', round($this->brightestPixel->getPoint()['x'], $this->roundPoint));
        $center->setAttribute('y', round($this->brightestPixel->getPoint()['y'], $this->roundPoint));
        $pixel->appendChild($center);
        return $pixel;
    }
}