<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AppBundle\Model\Shapes;

class Pedestrian extends ExportXml\Element
{
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
        $this->namespace = $namespace;
    }

    public function getElement(\DOMDocument $document)
    {
        $pedestrian = $document->createElementNS($this->namespace, 'pedestrian');

        $heightHalf = ($this->pedestrian->getBottomCenterY() - $this->pedestrian->getTopCenterY()) / 2;
        $widthHalf  = $heightHalf * 0.41;

        $topLeft = $document->createElementNS($this->namespace, 'top-center');
        $topLeft->setAttribute('x', $this->pedestrian->getTopCenterX());
        $topLeft->setAttribute('y', $this->pedestrian->getTopCenterY());
        $topLeft->setAttribute('aspect-ratio', 0.41);
        $pedestrian->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-center');
        $bottomRight->setAttribute('x', $this->pedestrian->getBottomCenterX());
        $bottomRight->setAttribute('y', $this->pedestrian->getBottomCenterY());
        $bottomRight->setAttribute('aspect-ratio', 0.41);
        $pedestrian->appendChild($bottomRight);

        return $pedestrian;
    }
}