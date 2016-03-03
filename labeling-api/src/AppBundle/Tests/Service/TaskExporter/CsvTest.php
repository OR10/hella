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
                5,
                10,
                array(
                    array(
                        'frameNumber' => 5,
                        'type' => 'vehicle',
                        'classes' => array('vehicle-type', 'truck', 'direction', 'direction-left', 'occlusion', 'occlusion-80', 'truncation', 'truncation-20-80'),
                    ),
                    array(
                        'frameNumber' => 6,
                        'type' => 'vehicle',
                        'classes' => array('vehicle-type', 'car', 'direction', 'direction-front', 'occlusion', 'occlusion-80', 'truncation', 'truncation-20'),
                    ),
                ),
                array(
                    array(
                        'id' => 1,
                        'frame_number' => 5,
                        'vehicleType' => 'truck',
                        'direction' => 'left',
                        'occlusion' => '80',
                        'truncation' => '20-80',
                    ),
                    array(
                        'id' => 2,
                        'frame_number' => 6,
                        'vehicleType' => 'car',
                        'direction' => 'front',
                        'occlusion' => '80',
                        'truncation' => '20',
                    )
                )
            )
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
        $task = $this->createLabelingTask(new Model\FrameRange($frameRangeStart, $frameRangeEnd));
        foreach($labeledThingInFrames as $labeledThingInFrame) {
            $this->createLabeledThingInFrame(
                $task,
                $labeledThingInFrame['frameNumber'],
                $labeledThingInFrame['type'],
                $labeledThingInFrame['classes']
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
     * @param Model\FrameRange $frameRange
     *
     * @return Model\LabelingTask
     */
    private function createLabelingTask(Model\FrameRange $frameRange)
    {
        return $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $this->videoFacade->save(Model\Video::create('test video')),
                $frameRange,
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
    }

    /**
     * Store a labeled thing for the given frame number and the given shapes in
     * the database.
     *
     * @param Model\LabelingTask $task
     * @param $frameNumber
     * @param null $type
     * @param array $classes
     * @param array $shapes
     * @param bool $incomplete
     * @return Model\LabeledThingInFrame
     */
    private function createLabeledThingInFrame(
        Model\LabelingTask $task,
        $frameNumber,
        $type = null,
        $classes = [],
        array $shapes = [],
        $incomplete = false
    ) {
        $labeledThing = $this->labeledThingFacade->save(
            Model\LabeledThing::create($task)
                ->setFrameRange($task->getFrameRange())
                ->setClasses($type === null ? [] : [(string) $type])
        );

        return $this->labeledThingInFrameFacade->save(
            Model\LabeledThingInFrame::create($labeledThing, $frameNumber)
                ->setShapesAsObjects($shapes)
                ->setIncomplete($incomplete)
                ->setClasses($classes)
        );
    }
}