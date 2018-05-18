<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Pedestrian extends ExportXml\Element
{
    use ShapeSetting;

    const ASPECT_RATIO = 0.41;

    /**
     * @var Shapes\Pedestrian
     */
    private $pedestrian;

    /**
     * @var string
     */
    private $namespace;

    /**
     * Pedestrian constructor.
     *
     * @param Shapes\Pedestrian $pedestrian
     * @param string            $namespace
     */
    public function __construct(Shapes\Pedestrian $pedestrian, string $namespace)
    {
        $this->pedestrian = $pedestrian;
        $this->namespace  = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $pedestrian = $document->createElementNS($this->namespace, 'pedestrian');

        $height = $this->pedestrian->getBottomCenterY() - $this->pedestrian->getTopCenterY();
        $width  = $height * self::ASPECT_RATIO;

        $topLeft = $document->createElementNS($this->namespace, 'top-center');
        $topLeft->setAttribute('x', round($this->pedestrian->getTopCenterX(), $this->roundPoint));
        $topLeft->setAttribute('y', round($this->pedestrian->getTopCenterY(), $this->roundPoint));
        $pedestrian->appendChild($topLeft);

        $topLeft = $document->createElementNS($this->namespace, 'top-left');
        $topLeft->setAttribute('x', round($this->pedestrian->getTopCenterX() - ($width / 2), $this->roundPoint));
        $topLeft->setAttribute('y', round($this->pedestrian->getTopCenterY(), $this->roundPoint));
        $pedestrian->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-center');
        $bottomRight->setAttribute('x', round($this->pedestrian->getBottomCenterX(), $this->roundPoint));
        $bottomRight->setAttribute('y', round($this->pedestrian->getBottomCenterY(), $this->roundPoint));
        $pedestrian->appendChild($bottomRight);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-right');
        $bottomRight->setAttribute('x', round($this->pedestrian->getBottomCenterX() + ($width / 2), $this->roundPoint));
        $bottomRight->setAttribute('y', round($this->pedestrian->getBottomCenterY(), $this->roundPoint));
        $pedestrian->appendChild($bottomRight);

        $aspectRatio = $document->createElementNS($this->namespace, 'aspect-ratio', self::ASPECT_RATIO);
        $pedestrian->appendChild($aspectRatio);

        return $pedestrian;
    }
}
