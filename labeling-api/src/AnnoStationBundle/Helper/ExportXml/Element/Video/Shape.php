<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Service;
use AppBundle\Model;

class Shape extends ExportXml\Element
{
    /**
     * @var Model\Shape
     */
    private $objectShape;

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

    /**
     * Shape constructor.
     *
     * @param Model\Shape                $shape
     * @param int                        $start
     * @param int                        $end
     * @param string                     $namespace
     * @param Model\CalibrationData|null $calibrationData
     * @param Service\DepthBuffer        $depthBufferService
     */
    public function __construct(
        Model\Shape $shape,
        int $start,
        int $end,
        string $namespace,
        Model\CalibrationData $calibrationData = null,
        Service\DepthBuffer $depthBufferService
    ) {
        $this->objectShape        = $shape;
        $this->start              = $start;
        $this->end                = $end;
        $this->namespace          = $namespace;
        $this->calibrationData    = $calibrationData;
        $this->depthBufferService = $depthBufferService;
    }

    /**
     * @param \DOMDocument $document
     * @return \DOMElement
     */
    public function getElement(\DOMDocument $document)
    {
        $shape = $document->createElementNS($this->namespace, 'shape');
        $shape->setAttribute('id', $this->objectShape->getId());
        $shape->setAttribute('start', $this->start);
        $shape->setAttribute('end', $this->end);

        switch (true) {
            case $this->objectShape instanceof Model\Shapes\Rectangle:
                $shapeElement = new Shape\Rectangle($this->objectShape, $this->namespace);
                break;
            case $this->objectShape instanceof Model\Shapes\Cuboid3d:
                $shapeElement = new Shape\Cuboid3d(
                    $this->objectShape,
                    $this->namespace,
                    $this->calibrationData,
                    $this->depthBufferService
                );
                break;
            case $this->objectShape instanceof Model\Shapes\Polyline:
                $shapeElement = new Shape\Polyline($this->objectShape, $this->namespace);
                break;
            case $this->objectShape instanceof Model\Shapes\Polygon:
                $shapeElement = new Shape\Polygon($this->objectShape, $this->namespace);
                break;
            case $this->objectShape instanceof Model\Shapes\Pedestrian:
                $shapeElement = new Shape\Pedestrian($this->objectShape, $this->namespace);
                break;
            case $this->objectShape instanceof Model\Shapes\Point:
                $shapeElement = new Shape\Point($this->objectShape, $this->namespace);
                break;
            case $this->objectShape instanceof Model\Shapes\BrightestPixel:
                $shapeElement = new Shape\BrightestPixel($this->objectShape, $this->namespace);
                break;
            case $this->objectShape instanceof Model\Shapes\Trapezoid:
                $shapeElement = new Shape\Trapezoid($this->objectShape, $this->namespace);
                break;
        }

        if (isset($shapeElement)) {
            $shape->appendChild($shapeElement->getElement($document));
        }

        return $shape;
    }
}
