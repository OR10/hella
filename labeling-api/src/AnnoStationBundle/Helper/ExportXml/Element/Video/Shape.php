<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;
use AnnoStationBundle\Service;
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

    /**
     * @var
     */
    private $namespace;

    /**
     * @var Model\CalibrationData
     */
    private $calibrationData;

    /**
     * @var Service\DepthBuffer
     */
    private $depthBufferService;

    public function __construct(
        Model\Shape $shape,
        $start,
        $end,
        $namespace,
        Model\CalibrationData $calibrationData = null,
        Service\DepthBuffer $depthBufferService
    ) {
        $this->shape              = $shape;
        $this->start              = $start;
        $this->end                = $end;
        $this->namespace          = $namespace;
        $this->calibrationData    = $calibrationData;
        $this->depthBufferService = $depthBufferService;
    }

    public function getElement(\DOMDocument $document)
    {
        $shape = $document->createElementNS($this->namespace, 'shape');
        $shape->setAttribute('id', $this->shape->getId());
        $shape->setAttribute('start', $this->start);
        $shape->setAttribute('end', $this->end);

        switch (true) {
            case $this->shape instanceof Model\Shapes\Rectangle:
                $shapeElement = new Shape\Rectangle($this->shape, $this->namespace);
                break;
            case $this->shape instanceof Model\Shapes\Cuboid3d:
                $shapeElement = new Shape\Cuboid3d(
                    $this->shape,
                    $this->namespace,
                    $this->calibrationData,
                    $this->depthBufferService
                );
                break;
            case $this->shape instanceof Model\Shapes\Polyline:
                $shapeElement = new Shape\Polyline($this->shape, $this->namespace);
                break;
            case $this->shape instanceof Model\Shapes\Polygon:
                $shapeElement = new Shape\Polygon($this->shape, $this->namespace);
                break;
            case $this->shape instanceof Model\Shapes\Pedestrian:
                $shapeElement = new Shape\Pedestrian($this->shape, $this->namespace);
                break;
            case $this->shape instanceof Model\Shapes\Point:
                $shapeElement = new Shape\Point($this->shape, $this->namespace);
                break;
        }

        if (isset($shapeElement)) {
            $shape->appendChild($shapeElement->getElement($document));
        }

        return $shape;
    }
}
