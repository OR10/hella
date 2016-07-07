<?php

namespace AppBundle\Tests\Service\ProjectExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AppBundle\Service;
use AppBundle\Service\ProjectExporter;
use AppBundle\Tests;

class CsvProjectTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var ProjectExporter\Csv
     */
    private $exporter;

    /**
     * @var Service\CalibrationFileConverter
     */
    private $calibrationFileConverter;

    protected function setUpImplementation()
    {
        $this->videoFacade = $this->getAnnostationService('database.facade.video');
        $this->projectFacade = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->exporter = $this->getAnnostationService('service.project_exporter.csv');
        $this->calibrationFileConverter = $this->getAnnostationService('service.calibration_file_converter');
    }

    public function pedestrianProvider()
    {
        return array(
            array(
                Model\LabelingTask::DRAWING_TOOL_PEDESTRIAN,
                Model\LabelingTask::INSTRUCTION_PERSON,
                array(
                    array(
                        'id' => 'pedestrian-1',
                        'type' => 'pedestrian',
                        'topCenter' => array(
                            'x' => 578,
                            'y' => 293,
                        ),
                        'bottomCenter' => array(
                            'x' => 578,
                            'y' => 466,
                        )
                    )
                ),
                array('occlusion-25', 'truncation-25-50', 'direction-front-right'),
                array(
                    array(
                        'frame_number' => 1,
                        'label_class' => 'person',
                        'position_x' => 542,
                        'position_y' => 293,
                        'width' => 71,
                        'height' => 173,
                        'occlusion' => 1,
                        'truncation' => 2,
                        'direction' => 'front-right',
                    )
                )
            ),
            array(
                Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
                Model\LabelingTask::INSTRUCTION_IGNORE,
                array(
                    array(
                        'id' => 'pedestrian-1',
                        'type' => 'rectangle',
                        'topLeft' => array(
                            'x' => 332,
                            'y' => 284,
                        ),
                        'bottomRight' => array(
                            'x' => 440,
                            'y' => 391,
                        )
                    )
                ),
                array('cyclist'),
                array(
                    array(
                        'frame_number' => 1,
                        'label_class' => 'ignore',
                        'position_x' => 332,
                        'position_y' => 284,
                        'width' => 108,
                        'height' => 107,
                        'occlusion' => 'unknown',
                        'truncation' => 'unknown',
                        'direction' => null,
                    )
                )
            ),
            array(
                Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
                Model\LabelingTask::INSTRUCTION_CYCLIST,
                array(
                    array(
                        'id' => 'pedestrian-1',
                        'type' => 'rectangle',
                        'topLeft' => array(
                            'x' => 332,
                            'y' => 284,
                        ),
                        'bottomRight' => array(
                            'x' => 440,
                            'y' => 391,
                        )
                    )
                ),
                array('occlusion-25', 'truncation-25-50', 'direction-front-right'),
                array(
                    array(
                        'frame_number' => 1,
                        'label_class' => 'cyclist',
                        'position_x' => 332,
                        'position_y' => 284,
                        'width' => 108,
                        'height' => 107,
                        'occlusion' => 1,
                        'truncation' => 2,
                        'direction' => 'front-right',
                    )
                )
            ),
        );
    }

    public function vehicleProvider()
    {
        return array(
            array(
                Model\LabelingTask::DRAWING_TOOL_CUBOID,
                Model\LabelingTask::INSTRUCTION_VEHICLE,
                array(
                    array(
                        'id' => 'pedestrian-1',
                        'type' => 'cuboid3d',
                        'vehicleCoordinates' => array(
                            [16, 6.5, 1.7],
                            [16, 4.8, 1.7],
                            [16, 4.8, 0],
                            [16, 6.5, 0],
                            [20, 6.5, 1.7],
                            [20, 4.8, 1.7],
                            [20, 4.8, 0],
                            [20, 6.5, 0]
                        ),
                    )
                ),
                array('occlusion-25', 'truncation-25-50', 'direction-front-right'),
                array(
                    array(
                        'frame_number' => 1,
                        'position_x' => 'null',
                        'position_y' => 'null',
                        'width' => 'null',
                        'height' => 'null',
                        'occlusion' => 1,
                        'truncation' => 2,
                        'direction' => null,
                        'vehicleType' => null,
                        'vertex_2d_0_x' => 112.8062,
                        'vertex_2d_0_y' => 285.9309,
                        'vertex_2d_1_x' => 227.0971,
                        'vertex_2d_1_y' => 285.6820,
                        'vertex_2d_2_x' => 227.4910,
                        'vertex_2d_2_y' => 405.2159,
                        'vertex_2d_3_x' => 113.3195,
                        'vertex_2d_3_y' => 404.0596,
                        'vertex_2d_4_x' => 194.2189,
                        'vertex_2d_4_y' => 289.7364,
                        'vertex_2d_5_x' => 288.7313,
                        'vertex_2d_5_y' => 289.6006,
                        'vertex_2d_6_x' => 288.9446,
                        'vertex_2d_6_y' => 386.9826,
                        'vertex_2d_7_x' => 194.5012,
                        'vertex_2d_7_y' => 386.3510,
                        'vertex_3d_0_x' => 16,
                        'vertex_3d_0_y' => 6.5,
                        'vertex_3d_0_z' => 1.7,
                        'vertex_3d_1_x' => 16,
                        'vertex_3d_1_y' => 4.8,
                        'vertex_3d_1_z' => 1.7,
                        'vertex_3d_2_x' => 16,
                        'vertex_3d_2_y' => 4.8,
                        'vertex_3d_2_z' => 0,
                        'vertex_3d_3_x' => 16,
                        'vertex_3d_3_y' => 6.5,
                        'vertex_3d_3_z' => 0,
                        'vertex_3d_4_x' => 20,
                        'vertex_3d_4_y' => 6.5,
                        'vertex_3d_4_z' => 1.7,
                        'vertex_3d_5_x' => 20,
                        'vertex_3d_5_y' => 4.8,
                        'vertex_3d_5_z' => 1.7,
                        'vertex_3d_6_x' => 20,
                        'vertex_3d_6_y' => 4.8,
                        'vertex_3d_6_z' => 0,
                        'vertex_3d_7_x' => 20,
                        'vertex_3d_7_y' => 6.5,
                        'vertex_3d_7_z' => 0,
                    )
                )
            ),
        );
    }

    /**
     * @dataProvider pedestrianProvider
     *
     * @param $drawingTool
     * @param $labelInstruction
     * @param $shapes
     * @param $classes
     * @param $expected
     */
    public function testPedestrianExport($drawingTool, $labelInstruction, $shapes, $classes, $expected)
    {
        $labelingTask = $this->createLabelingTask(
            range(0, 10),
            $drawingTool,
            $labelInstruction
        );

        $this->createLabeledThingInFrame(
            $labelingTask,
            1,
            'pedestrian',
            $classes,
            $shapes
        );

        $export = $this->exporter->getPedestrianLabelingData($labelingTask);

        $export = array_map(function ($data) {
            unset($data['id']);
            unset($data['uuid']);

            return $data;
        }, $export);

        $this->assertEquals($expected, $export);
    }

    /**
     * @dataProvider vehicleProvider
     *
     * @param $drawingTool
     * @param $labelInstruction
     * @param $shapes
     * @param $classes
     * @param $expected
     */
    public function testVehicleExport($drawingTool, $labelInstruction, $shapes, $classes, $expected)
    {
        $labelingTask = $this->createLabelingTask(
            range(0, 10),
            $drawingTool,
            $labelInstruction
        );

        $this->createLabeledThingInFrame(
            $labelingTask,
            1,
            'pedestrian',
            $classes,
            $shapes
        );

        $export = $this->exporter->getVehicleLabelingData($labelingTask);

        $export = array_map(function ($data) {
            unset($data['id']);
            unset($data['uuid']);

            return $data;
        }, $export);

        $this->assertEquals($expected, $export);
    }

    /**
     * Create a labeling task in the database.
     *
     * @param array $frameNumberMapping
     *
     * @param $drawingTool
     * @param $labelInstruction
     * @return Model\LabelingTask
     */
    private function createLabelingTask(array $frameNumberMapping, $drawingTool, $labelInstruction)
    {

        $this->calibrationFileConverter->setCalibrationData(__DIR__ . '/Calibration/Video.csv');
        $video = $this->videoFacade->save(Model\Video::create('test_video'));
        $video->setRawCalibration($this->calibrationFileConverter->getRawData());
        $video->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
        $video->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
        $video->setTranslation($this->calibrationFileConverter->getTranslation());
        $video->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());

        $task = $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $video,
                $this->projectFacade->save(Model\Project::create('test_project')),
                $frameNumberMapping,
                Model\LabelingTask::TYPE_OBJECT_LABELING,
                $drawingTool
            )
        );
        $task->setLabelInstruction($labelInstruction);

        return $task;
    }

    /**
     * Store a labeled thing for the given frame index and the given shapes in
     * the database.
     *
     * @param Model\LabelingTask $task
     * @param                    $frameIndex
     * @param null $type
     * @param array $classes
     * @param array $shapes
     * @param bool $incomplete
     *
     * @return Model\LabeledThingInFrame
     */
    private function createLabeledThingInFrame(
        Model\LabelingTask $task,
        $frameIndex,
        $type = null,
        $classes = [],
        array $shapes = [],
        $incomplete = false
    )
    {
        $labeledThing = $this->labeledThingFacade->save(
            Model\LabeledThing::create($task)
                ->setFrameRange(
                    new Model\FrameIndexRange(
                        $frameIndex,
                        $frameIndex
                    )
                )
                ->setClasses($type === null ? [] : [(string)$type])
        );

        return $this->labeledThingInFrameFacade->save(
            Model\LabeledThingInFrame::create($labeledThing, $frameIndex)
                ->setShapes($shapes)
                ->setIncomplete($incomplete)
                ->setClasses($classes)
        );
    }
}