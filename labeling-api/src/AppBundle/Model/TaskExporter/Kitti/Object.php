<?php

namespace AppBundle\Model\TaskExporter\Kitti;

use AppBundle\Model\Shapes;

class Object
{
    /**
     * @var string
     */
    private $type;

    /**
     * @var Shapes\BoundingBox
     */
    private $boundingBox;

    /**
     * @param string             $type
     * @param Shapes\BoundingBox $boundingBox
     */
    public function __construct($type, Shapes\BoundingBox $boundingBox)
    {
        $this->type        = (string) $type;
        $this->boundingBox = $boundingBox;
    }

    /**
     * Get the string representation of this object suitable for the K.I.T.T.I.
     * Object Detection Benchmark.
     *
     * @return string
     */
    public function __toString()
    {
        $type                = $this->getType();
        $truncation          = -1;
        $occlusion           = -1;
        $alpha               = -10;
        $leftBoundingBox     = $this->getBoundingBox()->getLeft();
        $topBoundingBox      = $this->getBoundingBox()->getTop();
        $rightBoundingBox    = $this->getBoundingBox()->getRight();
        $bottomBoundingBox   = $this->getBoundingBox()->getBottom();
        $height              = -1; //meters
        $width               = -1; //meters
        $length              = -1; //meters
        $location3dX         = -1000;
        $location3dY         = -1000;
        $location3dZ         = -1000;
        $rotationAroundY     = -10;
        $detectionConfidence = 1;

        return sprintf(
            '%s %.2f %d %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f',
            $type,
            $truncation,
            $occlusion,
            $alpha,
            $leftBoundingBox,
            $topBoundingBox,
            $rightBoundingBox,
            $bottomBoundingBox,
            $height,
            $width,
            $length,
            $location3dX,
            $location3dY,
            $location3dZ,
            $rotationAroundY,
            $detectionConfidence
        );
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return Shapes\BoundingBox
     */
    public function getBoundingBox()
    {
        return $this->boundingBox;
    }
}
