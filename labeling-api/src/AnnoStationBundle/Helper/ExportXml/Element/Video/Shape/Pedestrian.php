<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Pedestrian extends ExportXml\Element
{
    const ASPECT_RATIO = 0.41;

    /**
     * @var Shapes\Pedestrian
     */
    private $pedestrian;

    /**
     * @var string
     */
    private $namespace;

    public function __construct(Shapes\Pedestrian $pedestrian, $namespace)
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
        $topLeft->setAttribute('x', $this->pedestrian->getTopCenterX());
        $topLeft->setAttribute('y', $this->pedestrian->getTopCenterY());
        $pedestrian->appendChild($topLeft);

        $topLeft = $document->createElementNS($this->namespace, 'top-left');
        $topLeft->setAttribute('x', round($this->pedestrian->getTopCenterX() - ($width / 2)));
        $topLeft->setAttribute('y', $this->pedestrian->getTopCenterY());
        $pedestrian->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-center');
        $bottomRight->setAttribute('x', $this->pedestrian->getBottomCenterX());
        $bottomRight->setAttribute('y', $this->pedestrian->getBottomCenterY());
        $pedestrian->appendChild($bottomRight);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-right');
        $bottomRight->setAttribute('x', round($this->pedestrian->getBottomCenterX() + ($width / 2)));
        $bottomRight->setAttribute('y', $this->pedestrian->getBottomCenterY());
        $pedestrian->appendChild($bottomRight);

        $aspectRatio = $document->createElementNS($this->namespace, 'aspect-ratio', self::ASPECT_RATIO);
        $pedestrian->appendChild($aspectRatio);

        return $pedestrian;
    }
}
