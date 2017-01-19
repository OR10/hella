<?php
namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;
use AppBundle\Model;

class Shape extends ExportXml\Element
{
    /**
     * @var Model\Shape
     */
    private $shape;

    /**
     * @var
     */
    private $start;

    /**
     * @var
     */
    private $end;

    public function __construct(Model\Shape $shape, $start, $end)
    {
        $this->shape = $shape;
        $this->start = $start;
        $this->end   = $end;
    }

    public function getElement(\DOMDocument $document)
    {
        $shape = $document->createElement('shape');
        $shape->setAttribute('id', $this->shape->getId());
        $shape->setAttribute('start', $this->start);
        $shape->setAttribute('end', $this->end);

        switch (true) {
            case $this->shape instanceof Model\Shapes\Rectangle:
                $shapeElement = new Shape\Rectangle($this->shape);
                break;
            case $this->shape instanceof Model\Shapes\Cuboid3d:
                $shapeElement = new Shape\Cuboid3d($this->shape);
                break;
            case $this->shape instanceof Model\Shapes\Polygon:
                $shapeElement = new Shape\Polygon($this->shape);
                break;
            case $this->shape instanceof Model\Shapes\Pedestrian:
                $shapeElement = new Shape\Pedestrian($this->shape);
                break;
        }

        if (isset($shapeElement)) {
            $shape->appendChild($shapeElement->getElement($document));
        }

        return $shape;
    }
}