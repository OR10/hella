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
     * @param string $type
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
        return sprintf(
            '%s %.2f %d %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f',
            $this->getType(),                     // type
            -1,                                   // trucation
            -1,                                   // occlusion
            -10,                                  // alpha [-pi, pi]
            $this->getBoundingBox()->getLeft(),   // bounding-box-left in pixels
            $this->getBoundingBox()->getTop(),    // bounding-box-top in pixels
            $this->getBoundingBox()->getRight(),  // bounding-box-right in pixels
            $this->getBoundingBox()->getBottom(), // bounding-box-bottom in pixels
            -1,                                   // height in meters
            -1,                                   // width in meters
            -1,                                   // length in meters
            -1000,                                // 3d-location-x in camera coordinates (in meters)
            -1000,                                // 3d-location-y in camera coordinates (in meters)
            -1000,                                // 3d-location-z in camera coordinates (in meters)
            -10,                                  // rotation around y-axis [-pi, pi]
            1                                     // detection confidence (higher is better)
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
