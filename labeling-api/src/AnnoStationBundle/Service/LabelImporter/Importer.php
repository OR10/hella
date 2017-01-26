<?php

namespace AnnoStationBundle\Service\LabelImporter;

use AppBundle\Model;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\LabelImporter;
use AnnoStationBundle\Database\Facade;

abstract class Importer
{
    const ID           = 'id';
    const FRAME_NUMBER = 'frame_number';
    const CLASSES      = 'classes';

    /** 2d rectangles/pedestrian */
    const POSITION_X = 'position_x';
    const POSITION_Y = 'position_y';
    const WIDTH      = 'width';
    const HEIGHT     = 'height';

    /** 3d cuboids */
    const VERTEX_3D_0_X = 'vertex_3d_0_x';
    const VERTEX_3D_0_Y = 'vertex_3d_0_y';
    const VERTEX_3D_0_Z = 'vertex_3d_0_z';

    const VERTEX_3D_1_X = 'vertex_3d_1_x';
    const VERTEX_3D_1_Y = 'vertex_3d_1_y';
    const VERTEX_3D_1_Z = 'vertex_3d_1_z';

    const VERTEX_3D_2_X = 'vertex_3d_2_x';
    const VERTEX_3D_2_Y = 'vertex_3d_2_y';
    const VERTEX_3D_2_Z = 'vertex_3d_2_z';

    const VERTEX_3D_3_X = 'vertex_3d_3_x';
    const VERTEX_3D_3_Y = 'vertex_3d_3_y';
    const VERTEX_3D_3_Z = 'vertex_3d_3_z';

    const VERTEX_3D_4_X = 'vertex_3d_4_x';
    const VERTEX_3D_4_Y = 'vertex_3d_4_y';
    const VERTEX_3D_4_Z = 'vertex_3d_4_z';

    const VERTEX_3D_5_X = 'vertex_3d_5_x';
    const VERTEX_3D_5_Y = 'vertex_3d_5_y';
    const VERTEX_3D_5_Z = 'vertex_3d_5_z';

    const VERTEX_3D_6_X = 'vertex_3d_6_x';
    const VERTEX_3D_6_Y = 'vertex_3d_6_y';
    const VERTEX_3D_6_Z = 'vertex_3d_6_z';

    const VERTEX_3D_7_X = 'vertex_3d_7_x';
    const VERTEX_3D_7_Y = 'vertex_3d_7_y';
    const VERTEX_3D_7_Z = 'vertex_3d_7_z';

    /**
     * @var EntityProvider\Mapper
     */
    protected $entityProvider;

    /**
     * @var Service\TaskIncomplete
     */
    private $taskIncompleteService;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var array
     */
    private $labeledThingCache = [];

    public function __construct(
        Service\TaskIncomplete $taskIncompleteService,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThingFacade
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->taskIncompleteService     = $taskIncompleteService;
    }

    public function import(LabelImporter\Parser $parser, Model\LabelingTask $labelingTask)
    {
        $entities = $this->entityProvider->getEntities($parser);

        $drawingTool        = $labelingTask->getDrawingTool();
        $frameNumberMapping = array_flip($labelingTask->getFrameNumberMapping());

        foreach ($entities as $entity) {
            if (isset($this->labeledThingCache[$entity[self::ID]])) {
                $labeledThing = $this->labeledThingCache[$entity[self::ID]];
                $start        = $labeledThing->getFrameRange()->getStartFrameIndex();
                $end          = $labeledThing->getFrameRange()->getEndFrameIndex();
                if ($start > $frameNumberMapping[$entity[self::FRAME_NUMBER]]) {
                    $start = $frameNumberMapping[$entity[self::FRAME_NUMBER]];
                }
                if ($end < $frameNumberMapping[$entity[self::FRAME_NUMBER]]) {
                    $end = $frameNumberMapping[$entity[self::FRAME_NUMBER]];
                }
                $labeledThing->setFrameRange(
                    new Model\FrameIndexRange(
                        $start,
                        $end
                    )
                );
            } else {
                $labeledThing = new Model\LabeledThing($labelingTask, rand(0, 50));
                $labeledThing->setFrameRange(
                    new Model\FrameIndexRange(
                        $frameNumberMapping[$entity[self::FRAME_NUMBER]],
                        $frameNumberMapping[$entity[self::FRAME_NUMBER]]
                    )
                );
            }

            $labeledThing->setIncomplete(
                $this->taskIncompleteService->isLabeledThingIncomplete($labeledThing)
            );

            $this->labeledThingFacade->save($labeledThing);
            $this->labeledThingCache[$entity[self::ID]] = $labeledThing;
            $labeledThingInFrame                                          = new Model\LabeledThingInFrame(
                $labeledThing,
                $frameNumberMapping[$entity[self::FRAME_NUMBER]]
            );
            $labeledThingInFrame->setShapes([$this->getShapeModel($drawingTool, $entity)->toArray()]);
            $labeledThingInFrame->setClasses($entity[self::CLASSES]);

            $labeledThingInFrame->setIncomplete(
                $this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame)
            );

            $this->labeledThingInFrameFacade->save($labeledThingInFrame);
        }
    }

    /**
     * @param $drawingTool
     * @param $entity
     *
     * @return Model\Shapes\Cuboid3d|Model\Shapes\Pedestrian|Model\Shapes\Rectangle
     */
    protected function getShapeModel($drawingTool, $entity)
    {
        switch ($drawingTool) {
            case Model\LabelingTask::DRAWING_TOOL_RECTANGLE:
                return new Model\Shapes\Rectangle(
                    $this->getUuid(),
                    (float) $entity[self::POSITION_X],
                    (float) $entity[self::POSITION_Y],
                    (float) $entity[self::POSITION_X] + $entity[self::WIDTH],
                    (float) $entity[self::POSITION_Y] + $entity[self::HEIGHT]
                );
            case Model\LabelingTask::DRAWING_TOOL_PEDESTRIAN:
                return new Model\Shapes\Pedestrian(
                    $this->getUuid(),
                    (float) ($entity[self::POSITION_X] + ($entity[self::WIDTH] / 2)),
                    (float) $entity[self::POSITION_Y],
                    (float) ($entity[self::POSITION_X] + ($entity[self::WIDTH] / 2)),
                    (float) ($entity[self::POSITION_Y] + $entity[self::HEIGHT])
                );
            case Model\LabelingTask::DRAWING_TOOL_CUBOID:
                $frontTopLeft     = null;
                $frontTopRight    = null;
                $frontBottomRight = null;
                $frontBottomLeft  = null;
                $backTopLeft      = null;
                $backTopRight     = null;
                $backBottomRight  = null;
                $backBottomLeft   = null;

                if (!empty($entity[self::VERTEX_3D_0_X]) || !empty($entity[self::VERTEX_3D_0_Y]) || !empty($entity[self::VERTEX_3D_0_Z])) {
                    $frontTopLeft = [
                        (float) $entity[self::VERTEX_3D_0_X],
                        (float) $entity[self::VERTEX_3D_0_Y],
                        (float) $entity[self::VERTEX_3D_0_Z],
                    ];
                }

                if (!empty($entity[self::VERTEX_3D_1_X]) || !empty($entity[self::VERTEX_3D_1_Y]) || !empty($entity[self::VERTEX_3D_1_Z])) {
                    $frontTopRight = [
                        (float) $entity[self::VERTEX_3D_1_X],
                        (float) $entity[self::VERTEX_3D_1_Y],
                        (float) $entity[self::VERTEX_3D_1_Z],
                    ];
                }

                if (!empty($entity[self::VERTEX_3D_2_X]) || !empty($entity[self::VERTEX_3D_2_Y]) || !empty($entity[self::VERTEX_3D_2_Z])) {
                    $frontBottomRight = [
                        (float) $entity[self::VERTEX_3D_2_X],
                        (float) $entity[self::VERTEX_3D_2_Y],
                        (float) $entity[self::VERTEX_3D_2_Z],
                    ];
                }

                if (!empty($entity[self::VERTEX_3D_3_X]) || !empty($entity[self::VERTEX_3D_3_Y]) || !empty($entity[self::VERTEX_3D_3_Z])) {
                    $frontBottomLeft = [
                        (float) $entity[self::VERTEX_3D_3_X],
                        (float) $entity[self::VERTEX_3D_3_Y],
                        (float) $entity[self::VERTEX_3D_3_Z],
                    ];
                }

                if (!empty($entity[self::VERTEX_3D_4_X]) || !empty($entity[self::VERTEX_3D_4_Y]) || !empty($entity[self::VERTEX_3D_4_Z])) {
                    $backTopLeft = [
                        (float) $entity[self::VERTEX_3D_4_X],
                        (float) $entity[self::VERTEX_3D_4_Y],
                        (float) $entity[self::VERTEX_3D_4_Z],
                    ];
                }

                if (!empty($entity[self::VERTEX_3D_5_X]) || !empty($entity[self::VERTEX_3D_5_Y]) || !empty($entity[self::VERTEX_3D_5_Z])) {
                    $backTopRight = [
                        (float) $entity[self::VERTEX_3D_5_X],
                        (float) $entity[self::VERTEX_3D_5_Y],
                        (float) $entity[self::VERTEX_3D_5_Z],
                    ];
                }

                if (!empty($entity[self::VERTEX_3D_6_X]) || !empty($entity[self::VERTEX_3D_6_Y]) || !empty($entity[self::VERTEX_3D_6_Z])) {
                    $backBottomRight = [
                        (float) $entity[self::VERTEX_3D_6_X],
                        (float) $entity[self::VERTEX_3D_6_Y],
                        (float) $entity[self::VERTEX_3D_6_Z],
                    ];
                }

                if (!empty($entity[self::VERTEX_3D_7_X]) || !empty($entity[self::VERTEX_3D_7_Y]) || !empty($entity[self::VERTEX_3D_7_Z])) {
                    $backBottomLeft = [
                        (float) $entity[self::VERTEX_3D_7_X],
                        (float) $entity[self::VERTEX_3D_7_Y],
                        (float) $entity[self::VERTEX_3D_7_Z],
                    ];
                }

                return new Model\Shapes\Cuboid3d(
                    $this->getUuid(),
                    $frontTopLeft,
                    $frontTopRight,
                    $frontBottomRight,
                    $frontBottomLeft,
                    $backTopLeft,
                    $backTopRight,
                    $backBottomRight,
                    $backBottomLeft
                );
        }
    }

    /**
     * @return string
     */
    protected function getUuid()
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            // 32 bits for "time_low"
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            // 16 bits for "time_mid"
            mt_rand(0, 0xffff),
            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand(0, 0x0fff) | 0x4000,
            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand(0, 0x3fff) | 0x8000,
            // 48 bits for "node"
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0xffff)
        );
    }
}
