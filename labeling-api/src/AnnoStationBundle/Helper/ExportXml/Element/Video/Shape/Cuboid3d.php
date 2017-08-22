<?php

namespace AnnoStationBundle\Helper\ExportXml\Element\Video\Shape;

use AnnoStationBundle\Helper\ExportXml;
use AnnoStationBundle\Service;
use AppBundle\Model\Shapes;
use AppBundle\Model;

class Cuboid3d extends ExportXml\Element
{
    /**
     * @var Shapes\Cuboid3d
     */
    private $cuboid3d;

    /**
     * @var string
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
        Shapes\Cuboid3d $cuboid3d,
        $namespace,
        Model\CalibrationData $calibrationData,
        Service\DepthBuffer $depthBufferService
    ) {
        $this->cuboid3d           = $cuboid3d;
        $this->namespace          = $namespace;
        $this->depthBufferService = $depthBufferService;
        $this->calibrationData    = $calibrationData;
    }

    public function getElement(\DOMDocument $document)
    {
        $cuboid = $document->createElementNS($this->namespace, 'cuboid');
        $topLeftFrontPoints = $this->cuboid3d->getFrontTopLeft();

        if ($topLeftFrontPoints !== null) {
            $topLeftFront = $document->createElementNS($this->namespace, 'top-left-front');
            $topLeftFront->setAttribute('x', round($topLeftFrontPoints[0], 4));
            $topLeftFront->setAttribute('y', round($topLeftFrontPoints[1], 4));
            $topLeftFront->setAttribute('z', round($topLeftFrontPoints[2], 4));
            $cuboid->appendChild($topLeftFront);
        }

        $topRightFrontPoints = $this->cuboid3d->getFrontTopRight();
        if ($topRightFrontPoints !== null) {
            $topRightFront = $document->createElementNS($this->namespace, 'top-right-front');
            $topRightFront->setAttribute('x', round($topRightFrontPoints[0], 4));
            $topRightFront->setAttribute('y', round($topRightFrontPoints[1], 4));
            $topRightFront->setAttribute('z', round($topRightFrontPoints[2], 4));
            $cuboid->appendChild($topRightFront);
        }

        $bottomRightFrontPoints = $this->cuboid3d->getFrontBottomRight();
        if ($bottomRightFrontPoints !== null) {
            $bottomRightFront = $document->createElementNS($this->namespace, 'bottom-right-front');
            $bottomRightFront->setAttribute('x', round($bottomRightFrontPoints[0], 4));
            $bottomRightFront->setAttribute('y', round($bottomRightFrontPoints[1], 4));
            $bottomRightFront->setAttribute('z', round($bottomRightFrontPoints[2], 4));
            $cuboid->appendChild($bottomRightFront);
        }

        $bottomLeftFrontPoints = $this->cuboid3d->getFrontBottomLeft();
        if ($bottomLeftFrontPoints !== null) {
            $bottomLeftFront = $document->createElementNS($this->namespace, 'bottom-left-front');
            $bottomLeftFront->setAttribute('x', round($bottomLeftFrontPoints[0], 4));
            $bottomLeftFront->setAttribute('y', round($bottomLeftFrontPoints[1], 4));
            $bottomLeftFront->setAttribute('z', round($bottomLeftFrontPoints[2], 4));
            $cuboid->appendChild($bottomLeftFront);
        }

        $topLeftBackPoints = $this->cuboid3d->getBackTopLeft();
        if ($topLeftBackPoints !== null) {
            $topLeftBack = $document->createElementNS($this->namespace, 'top-left-back');
            $topLeftBack->setAttribute('x', round($topLeftBackPoints[0], 4));
            $topLeftBack->setAttribute('y', round($topLeftBackPoints[1], 4));
            $topLeftBack->setAttribute('z', round($topLeftBackPoints[2], 4));
            $cuboid->appendChild($topLeftBack);
        }

        $topRightBackPoints = $this->cuboid3d->getBackTopRight();
        if ($topRightBackPoints !== null) {
            $topRightBack = $document->createElementNS($this->namespace, 'top-right-back');
            $topRightBack->setAttribute('x', round($topRightBackPoints[0], 4));
            $topRightBack->setAttribute('y', round($topRightBackPoints[1], 4));
            $topRightBack->setAttribute('z', round($topRightBackPoints[2], 4));
            $cuboid->appendChild($topRightBack);
        }

        $bottomRightBackPoints = $this->cuboid3d->getBackBottomRight();
        if ($bottomRightBackPoints !== null) {
            $bottomRightBack = $document->createElementNS($this->namespace, 'bottom-right-back');
            $bottomRightBack->setAttribute('x', round($bottomRightBackPoints[0], 4));
            $bottomRightBack->setAttribute('y', round($bottomRightBackPoints[1], 4));
            $bottomRightBack->setAttribute('z', round($bottomRightBackPoints[2], 4));
            $cuboid->appendChild($bottomRightBack);
        }

        $bottomLeftBackPoints = $this->cuboid3d->getBackBottomLeft();
        if ($bottomLeftBackPoints !== null) {
            $bottomLeftBack = $document->createElementNS($this->namespace, 'bottom-left-back');
            $bottomLeftBack->setAttribute('x', round($bottomLeftBackPoints[0], 4));
            $bottomLeftBack->setAttribute('y', round($bottomLeftBackPoints[1], 4));
            $bottomLeftBack->setAttribute('z', round($bottomLeftBackPoints[2], 4));
            $cuboid->appendChild($bottomLeftBack);
        }

        $vertices = $this->depthBufferService->getVertices($this->cuboid3d, $this->calibrationData->getCalibration());

        $cuboidSites = [
            'top-left-front'     => 0,
            'top-right-front'    => 1,
            'bottom-right-front' => 2,
            'bottom-left-front'  => 3,
            'top-left-back'      => 4,
            'top-right-back'     => 5,
            'bottom-right-back'  => 6,
            'bottom-left-back'   => 7,
        ];

        foreach ($cuboidSites as $vertexName => $vertexPoint) {
            $imagePoint = $document->createElementNS($this->namespace, 'image-' . $vertexName);
            $imagePoint->setAttribute('x', round($vertices[0][$vertexPoint][0], 4));
            $imagePoint->setAttribute('y', round($vertices[0][$vertexPoint][1],4));
            $cuboid->appendChild($imagePoint);
        }

        return $cuboid;
    }
}
