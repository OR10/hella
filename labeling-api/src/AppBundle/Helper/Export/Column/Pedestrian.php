<?php

namespace AppBundle\Helper\Export\Column;

use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Cell;
use AppBundle\Model;

class Pedestrian extends Export\Column {
    const TYPE_X = 'type.x';
    const TYPE_Y = 'type.y';
    const TYPE_WIDTH = 'type.width';
    const TYPE_HEIGHT = 'type.height';

    const ASPECT_RATIO = 0.41;

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
        if(count($shapes) === 0) {
            return new Cell\DefaultValue($this);
        }

        $pedestrianShape = $shapes[0];

        if ($pedestrianShape['type'] !== 'pedestrian') {
            return new Cell\DefaultValue($this);
        }

        $topCenterX = $pedestrianShape['topCenter']['x'];
        $topCenterY = $pedestrianShape['topCenter']['y'];
        $bottomCenterY = $pedestrianShape['bottomCenter']['y'];

        $height = $bottomCenterY - $topCenterY;
        $width = $height * self::ASPECT_RATIO;
        $topLeftX = $topCenterX - ($width / 2);
        $topLeftY = $topCenterY;

        switch ($this->type) {
            case self::TYPE_X:
                return new Cell\Integer($topLeftX);
            case self::TYPE_Y:
                return new Cell\Integer($topLeftY);
            case self::TYPE_WIDTH:
                return new Cell\Integer($width);
            case self::TYPE_HEIGHT:
            return new Cell\Integer($height);
            default:
                throw new \RuntimeException('Unknown Pedestrian Column Type: ' . $this->type);
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
                throw new \RuntimeException('Unknown Pedestrian Column Type: ' . $this->type);
        }
    }

    public function getDefaultValue()
    {
        return '';
    }
}