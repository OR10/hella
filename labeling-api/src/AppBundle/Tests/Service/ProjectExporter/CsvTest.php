<?php

namespace AppBundle\Tests\Service\ProjectExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
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

    protected function setUpImplementation()
    {
        $this->videoFacade = $this->getAnnostationService('database.facade.video');
        $this->projectFacade = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->exporter = $this->getAnnostationService('service.project_exporter.csv');
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

    /**
     * @dataProvider pedestrianProvider
     *
     * @param $drawingTool
     * @param $labelInstruction
     * @param $shapes
     * @param $classes
     * @param $expected
     */
    public function testPedestrianExport($drawingTool, $labelInstruction,$shapes, $classes, $expected)
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
        $task = $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $this->videoFacade->save(Model\Video::create('test_video')),
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