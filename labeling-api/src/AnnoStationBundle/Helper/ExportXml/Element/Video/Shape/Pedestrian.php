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

        $topLeft = $document->createElementNS($this->namespace, 'top-center');
        $topLeft->setAttribute('x', $this->pedestrian->getTopCenterX());
        $topLeft->setAttribute('y', $this->pedestrian->getTopCenterY());
        $pedestrian->appendChild($topLeft);

        $bottomRight = $document->createElementNS($this->namespace, 'bottom-center');
        $bottomRight->setAttribute('x', $this->pedestrian->getBottomCenterX());
        $bottomRight->setAttribute('y', $this->pedestrian->getBottomCenterY());
        $pedestrian->appendChild($bottomRight);

        $aspectRatio = $document->createElementNS($this->namespace, 'aspect-ratio', 0.41);
        $pedestrian->appendChild($aspectRatio);

        return $pedestrian;
    }
}
