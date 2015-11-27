<?php

namespace AppBundle\Tests\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service\TaskExporter;
use AppBundle\Tests;
use Doctrine\ODM\CouchDB;

class KittiTest extends Tests\KernelTestCase
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
     * @var TaskExporter\Kitti
     */
    private $exporter;

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    protected function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnoService('database.facade.video');
        $this->labelingTaskFacade        = $this->getAnnoService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnoService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnoService('database.facade.labeled_thing_in_frame');
        $this->exporter                  = $this->getAnnoService('service.task_exporter.kitti');
        $this->documentManager           = $this->getService('doctrine_couchdb.odm.default_document_manager');
    }

    private function getAnnoService($name)
    {
        return $this->getService(sprintf('annostation.labeling_api.%s', $name));
    }

    private function getService($name)
    {
        return static::$kernel->getContainer()->get($name);
    }

    public function testExportingTaskWithoutLabeledDataReturnsEmptyZipArchive()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 10));

        $this->assertEquals(array_fill(1, 10, []), $this->exporter->getInternalExportData($task));
    }

    public function testExportingTaskWithOneLabeledThingInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 10));
        $this->createLabeledThingInFrame($task, 1, 'pedestrian', [
            $this->createRectangleShape(10, 10, 100, 100),
        ]);

        $expectedResult = [
            1 => [$this->createExpectedResultEntry('Pedestrian', 10, 10, 100, 100)],
        ] + array_fill(2, 9, []);

        $this->assertEquals($expectedResult, $this->exporter->getInternalExportData($task));
    }

    public function testExportingTaskWithOneLabeledThingWithMultipleShapesInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 10));
        $this->createLabeledThingInFrame($task, 1, 'cyclist', [
            $this->createRectangleShape(10, 10, 100, 100),
            $this->createRectangleShape(5, 5, 150, 150),
        ]);

        $expectedResult = [
            1 => [$this->createExpectedResultEntry('Cyclist', 5, 5, 150, 150)],
        ] + array_fill(2, 9, []);

        $this->assertEquals($expectedResult, $this->exporter->getInternalExportData($task));
    }

    public function testExportingTaskWithTwoLabeledThingsWithMultipleShapesInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 10));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            $this->createRectangleShape(10, 10, 100, 100),
            $this->createRectangleShape(5, 5, 150, 150),
        ]);
        $this->createLabeledThingInFrame($task, 1, 'pedestrian', [
            $this->createRectangleShape(300, 10, 400, 100),
            $this->createRectangleShape(290, 5, 350, 95),
        ]);

        $expectedResult = [
            1 => [
                $this->createExpectedResultEntry('Car', 5, 5, 150, 150),
                $this->createExpectedResultEntry('Pedestrian', 290, 5, 400, 100),
            ],
        ] + array_fill(2, 9, []);

        $this->assertEquals($expectedResult, $this->exporter->getInternalExportData($task));
    }

    public function testExportingTaskWithLabeledThingsInMultipleFrames()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 10));

        for ($frameNumber = 5; $frameNumber <= 10; ++$frameNumber) {
            $this->createLabeledThingInFrame($task, $frameNumber, 'pedestrian', [
                $this->createRectangleShape(10, 10, 100, 100),
            ]);
        }

        $expectedResult = array_fill(1, 5, []);
        for ($frameNumber = 5; $frameNumber <= 10; ++$frameNumber) {
            $expectedResult[$frameNumber] = [
                $this->createExpectedResultEntry('Pedestrian', 10, 10, 100, 100),
            ];
        }

        $this->assertEquals($expectedResult, $this->exporter->getInternalExportData($task));
    }

    public function testExportingTaskWithEllipseShapeInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 1));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            $this->createEllipseShape(10, 10, 100, 10),
        ]);

        $expectedResult = [
            1 => [
                $this->createExpectedResultEntry('Car', 10, 10, 110, 20),
            ],
        ];

        $this->assertEquals($expectedResult, $this->exporter->getInternalExportData($task));
    }

    /**
     * @expectedException AppBundle\Service\TaskExporter\Exception\Kitti
     */
    public function testExportingTaskWithPolygonShapeWithoutAnyPointThrowsKittiException()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 1));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            $this->createPolygonShape([
                // No point should lead to an exception
            ]),
        ]);

        $this->exporter->getInternalExportData($task);
    }

    public function testExportingTaskWithPolygonShapeInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 1));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            $this->createPolygonShape([
                ['x' =>   7, 'y' =>   8],
                ['x' =>  17, 'y' =>  28],
                ['x' =>  -7, 'y' =>  -8],
                ['x' => 107, 'y' => 308],
            ]),
        ]);

        $expectedResult = [
            1 => [
                $this->createExpectedResultEntry('Car', -7, -8, 107, 308),
            ],
        ];

        $this->assertEquals($expectedResult, $this->exporter->getInternalExportData($task));
    }

    public function testExportingTaskWithIncompleteLabeledThingsInFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 1));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            $this->createPolygonShape([
                ['x' =>   7, 'y' =>   8],
                ['x' =>  17, 'y' =>  28],
                ['x' =>  -7, 'y' =>  -8],
                ['x' => 107, 'y' => 308],
            ]),
        ]);
        $incompleteThing = $this->createLabeledThingInFrame($task, 1, null, [], true);

        $expectedResult = [
            1 => [
                $this->createExpectedResultEntry('Car', -7, -8, 107, 308),
            ],
        ];

        $this->assertEquals($expectedResult, $this->exporter->getInternalExportData($task));
    }

    /**
     * Create one expected result entry from the given arguments.
     *
     * @param string $type
     * @param float  $left
     * @param float  $top
     * @param float  $right
     * @param float  $bottom
     *
     * @return array
     */
    private function createExpectedResultEntry($type, $left, $top, $right, $bottom)
    {
        return [
            'type' => (string) $type,
            'boundingBox' => [
                'left'   => (float) $left,
                'top'    => (float) $top,
                'right'  => (float) $right,
                'bottom' => (float) $bottom,
            ],
        ];
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
        $video = new Model\Video('test video');
        $this->videoFacade->save($video);

        $task = new Model\LabelingTask($video, $frameRange);
        $this->labelingTaskFacade->save($task);

        return $task;
    }

    /**
     * Store a labeled thing for the given frame number and the given shapes in
     * the database.
     */
    private function createLabeledThingInFrame(
        Model\LabelingTask $task,
        $frameNumber,
        $type = null,
        array $shapes = [],
        $incomplete = false
    ) {
        $labeledThing = new Model\LabeledThing($task);
        $labeledThing->setFrameRange($task->getFrameRange());

        $this->labeledThingFacade->save($labeledThing);

        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
        $labeledThingInFrame->setFrameNumber($frameNumber);
        $labeledThingInFrame->setShapes($shapes);
        $labeledThingInFrame->setIncomplete($incomplete);

        if ($type !== null) {
            $labeledThingInFrame->setClasses([(string) $type]);
        }

        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }

    /**
     * @param float $left
     * @param float $top
     * @param float $right
     * @param float $bottom
     *
     * @return array
     */
    private function createRectangleShape($left, $top, $right, $bottom)
    {
        return [
            'type' => 'rectangle',
            'topLeft' => [
                'x' => (float) $left,
                'y' => (float) $top,
            ],
            'bottomRight' => [
                'x' => (float) $right,
                'y' => (float) $bottom,
            ],
        ];
    }

    /**
     * @param float $x
     * @param float $y
     * @param float $width
     * @param float $height
     *
     * @return array
     */
    private function createEllipseShape($x, $y, $width, $height)
    {
        return [
            'type' => 'ellipse',
            'point' => [
                'x' => (float) $x,
                'y' => (float) $y,
            ],
            'size' => [
                'width'  => (float) $width,
                'height' => (float) $height,
            ],
        ];
    }

    /**
     * @param array $points
     * @return array
     *
     */
    private function createPolygonShape(array $points)
    {
        $result = [
            'type'   => 'polygon',
            'points' => [],
        ];

        foreach ($points as $point) {
            $result['points'][] = ['x' => $point['x'], 'y' => $point['y']];
        }

        return $result;
    }
}
