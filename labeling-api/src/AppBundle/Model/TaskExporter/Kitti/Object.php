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
