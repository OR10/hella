<?php

namespace AppBundle\Tests\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AppBundle\Model\TaskExporter\Csv;
use AppBundle\Service\TaskExporter;
use AppBundle\Tests;

class CsvTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

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
     * @var TaskExporter\Csv
     */
    private $exporter;

    protected function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->exporter                  = $this->getAnnostationService('service.task_exporter.csv');
    }

    public function taskAndLabeledThingInFrameProvider()
    {
        return array(
            array(
                1,
                5,
                array(
                    array(
                        'frameIndex'  => 0,
                        'type'        => 'vehicle',
                        'classes'     => array(
                            'vehicle-type',
                            'truck',
                            'direction',
                            'direction-left',
                            'occlusion',
                            'occlusion-80',
                            'truncation',
                            'truncation-20-80',
                        ),
                        'shapes'      => array(
                            array(
                                'id'          => 'shape 1',
                                'type'        => 'rectangle',
                                'topLeft'     => array('x' => 531, 'y' => 301),
                                'bottomRight' => array('x' => 617, 'y' => 382),
                            ),
                        ),
                    ),
                    array(
                        'frameIndex'  => 1,
                        'type'        => 'vehicle',
                        'classes'     => array(
                            'vehicle-type',
                            'car',
                            'direction',
                            'direction-front',
                            'occlusion',
                            'occlusion-80',
                            'truncation',
                            'truncation-20',
                        ),
                        'shapes'      => array(
                            array(
                                'id'          => 'shape 2',
                                'type'        => 'rectangle',
                                'topLeft'     => array('x' => 131, 'y' => 501),
                                'bottomRight' => array('x' => 917, 'y' => 882),
                            ),
                        ),
                    ),
                ),
                array(
                    array(
                        'id'           => 1,
                        'frame_number' => 1,
                        'vehicleType'  => 'truck',
                        'direction'    => 'left',
                        'occlusion'    => '80',
                        'truncation'   => '20-80',
                        'position_x'   => 531,
                        'position_y'   => 301,
                        'width'        => 86,
                        'height'       => 81,
                    ),
                    array(
                        'id'           => 2,
                        'frame_number' => 2,
                        'vehicleType'  => 'car',
                        'direction'    => 'front',
                        'occlusion'    => '80',
                        'truncation'   => '20',
                        'position_x'   => 131,
                        'position_y'   => 501,
                        'width'        => 786,
                        'height'       => 381,
                    ),
                ),
            ),
        );
    }

    /**
     * @dataProvider taskAndLabeledThingInFrameProvider
     *
     * @param $frameRangeStart
     * @param $frameRangeEnd
     * @param $labeledThingInFrames
     * @param $expected
     */
    public function testCsvExport($frameRangeStart, $frameRangeEnd, $labeledThingInFrames, $expected)
    {
        $task = $this->createLabelingTask(range($frameRangeStart, $frameRangeEnd));
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $this->createLabeledThingInFrame(
                $task,
                $labeledThingInFrame['frameIndex'],
                $labeledThingInFrame['type'],
                $labeledThingInFrame['classes'],
                $labeledThingInFrame['shapes']
            );
        }

        $this->assertEquals(
            $expected,
            $this->exporter->getVehicleLabelingData($task)
        );
    }

    /**
     * Create a labeling task in the database.
     *
     * @param array $frameNumberMapping
     * @return Model\LabelingTask
     *
     */
    private function createLabelingTask(array $frameNumberMapping)
    {
        return $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $this->videoFacade->save(Model\Video::create('test video')),
                $frameNumberMapping,
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
    }

    /**
     * Store a labeled thing for the given frame index and the given shapes in
     * the database.
     *
     * @param Model\LabelingTask $task
     * @param $frameIndex
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
    ) {
        $labeledThing = $this->labeledThingFacade->save(
            Model\LabeledThing::create($task)
                ->setFrameRange(
                    new Model\FrameRange(
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