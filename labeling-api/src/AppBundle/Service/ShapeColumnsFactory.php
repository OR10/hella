<?php

namespace AppBundle\Service;

use AppBundle\Helper\Export;

class ShapeColumnsFactory
{
    /**
     * @var Export\ShapeColumns[]
     */
    private $drawingToolToShapeColumnsMapping;

    public function __construct(array $drawingToolToShapeColumnsMapping)
    {
        $this->drawingToolToShapeColumnsMapping = $drawingToolToShapeColumnsMapping;
    }

    /**
     * Create an array of Columns needed to represent shapes of the given drawingTool type
     *
     * @param string $drawingTool
     *
     * @return Export\Column[]
     */
    public function create($drawingTool)
    {
        if (!array_key_exists($drawingTool, $this->drawingToolToShapeColumnsMapping)) {
            throw new \RuntimeException('Unable to find ShapeColumns mapping for ' . $drawingTool);
        }

        $shapeColumns = $this->drawingToolToShapeColumnsMapping[$drawingTool];
        return $shapeColumns->create();
    }
}
