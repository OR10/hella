<?php

namespace AppBundle\Helper\Export\Column;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Cell;
use AppBundle\Model;

class Rectangle extends Export\Column {
    const TYPE_X = 'type.x';
    const TYPE_Y = 'type.y';
    const TYPE_WIDTH = 'type.width';
    const TYPE_HEIGHT = 'type.height';

    /**
     * @var string
     */
    private $type;

    /**
     * Rectangle constructor.
     *
     * @param string $type
     */
    public function __construct($type) {
        $this->type = $type;
    }

    public function createCell(
        Model\Project $project,
        Model\Video $video,
        Model\LabelingTask $task,
        Model\LabeledThingInFrame $labeledThingInFrame
    ) {
        $shapes = $labeledThingInFrame->getShapes();
        $rectangleShape = $shapes[0];

        $topLeftX = $rectangleShape['topLeft']['x'];
        $topLeftY = $rectangleShape['topLeft']['y'];
        $bottomRightX = $rectangleShape['bottomRight']['x'];
        $bottomRightY = $rectangleShape['bottomRight']['y'];
        $width = $bottomRightX - $topLeftX;
        $height = $bottomRightY - $topLeftY;

        switch ($this->type) {
            case self::TYPE_X:
                return new Cell\Integer($this, $topLeftX);
            case self::TYPE_Y:
                return new Cell\Integer($this, $topLeftY);
            case self::TYPE_WIDTH:
                return new Cell\Integer($this, $width);
            case self::TYPE_HEIGHT:
            return new Cell\Integer($this, $height);
            default:
                throw new \RuntimeException('Unknown Rectangle Column Type: ' . $this->type);
        }
    }

    public function getHeader()
    {
        switch ($this->type) {
            case self::TYPE_X:
                return 'position_x';
            case self::TYPE_Y:
                return 'position_y';
            case self::TYPE_WIDTH:
                return 'width';
            case self::TYPE_HEIGHT:
                return 'height';
            default:
                throw new \RuntimeException('Unknown Rectangle Column Type: ' . $this->type);
        }
    }

    public function getDefaultValue()
    {
        return '';
    }
}