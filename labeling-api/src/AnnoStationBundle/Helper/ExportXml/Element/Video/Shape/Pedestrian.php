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

    public function __construct(Shapes\Pedestrian $pedestrian)
    {
        $this->pedestrian = $pedestrian;
    }

    public function getElement(\DOMDocument $document)
    {
        $pedestrian = $document->createElement('pedestrian');

        $heightHalf = ($this->pedestrian->getBottomCenterY() - $this->pedestrian->getTopCenterY()) / 2;
        $widthHalf  = $heightHalf * 0.41;

        $topLeft = $document->createElement('top-center');
        $topLeft->setAttribute('x', $this->pedestrian->getTopCenterX());
        $topLeft->setAttribute('y', $this->pedestrian->getTopCenterY());
        $topLeft->setAttribute('aspect-ratio', 0.41);
        $pedestrian->appendChild($topLeft);

        $bottomRight = $document->createElement('bottom-center');
        $bottomRight->setAttribute('x', $this->pedestrian->getBottomCenterX());
        $bottomRight->setAttribute('y', $this->pedestrian->getBottomCenterY());
        $bottomRight->setAttribute('aspect-ratio', 0.41);
        $pedestrian->appendChild($bottomRight);

        return $pedestrian;
    }
}