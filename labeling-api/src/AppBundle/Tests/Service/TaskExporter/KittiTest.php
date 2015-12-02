<?php

namespace AppBundle\Tests\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AppBundle\Model\TaskExporter\Kitti;
use AppBundle\Service\TaskExporter;
use AppBundle\Tests;
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

        $this->assertEquals(
            array_fill(1, 10, []),
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithOneLabeledThingInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 9));
        $this->createLabeledThingInFrame($task, 1, 'pedestrian', [
            new Shapes\Rectangle('test', 10, 10, 100, 100),
        ]);

        $this->assertEquals(
            [
                1 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                2 => [],
                3 => [],
                4 => [],
                5 => [],
                6 => [],
                7 => [],
                8 => [],
                9 => [],
                9 => [],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithOneLabeledThingWithMultipleShapesInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 9));
        $this->createLabeledThingInFrame($task, 1, 'cyclist', [
            new Shapes\Rectangle('test', 10, 10, 100, 100),
            new Shapes\Rectangle('test', 5, 5, 150, 150),
        ]);

        $this->assertEquals(
            [
                1 => [new Kitti\Object('Cyclist', new Shapes\BoundingBox(5, 5, 150, 150))],
                2 => [],
                3 => [],
                4 => [],
                5 => [],
                6 => [],
                7 => [],
                8 => [],
                9 => [],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithTwoLabeledThingsWithMultipleShapesInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 9));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            new Shapes\Rectangle('test', 10, 10, 100, 100),
            new Shapes\Rectangle('test', 5, 5, 150, 150),
        ]);
        $this->createLabeledThingInFrame($task, 1, 'pedestrian', [
            new Shapes\Rectangle('test', 300, 10, 400, 100),
            new Shapes\Rectangle('test', 290, 5, 350, 95),
        ]);

        $this->assertEquals(
            [
                1 => [
                    new Kitti\Object('Car', new Shapes\BoundingBox(5, 5, 150, 150)),
                    new Kitti\Object('Pedestrian', new Shapes\BoundingBox(290, 5, 400, 100)),
                ],
                2 => [],
                3 => [],
                4 => [],
                5 => [],
                6 => [],
                7 => [],
                8 => [],
                9 => [],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithLabeledThingsInMultipleFrames()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 9));

        foreach (range(5, 9) as $frameNumber) {
            $this->createLabeledThingInFrame($task, $frameNumber, 'pedestrian', [
                new Shapes\Rectangle('test', 10, 10, 100, 100),
            ]);
        }

        $this->assertEquals(
            [
                1 => [],
                2 => [],
                3 => [],
                4 => [],
                5 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                6 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                7 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                8 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                9 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithEllipseShapeInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 1));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            new Shapes\Ellipse('test', 10, 10, 100, 10),
        ]);

        $this->assertEquals(
            [
                1 => [new Kitti\Object('Car', new Shapes\BoundingBox(10, 10, 110, 20))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithPolygonShapeInOneFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 1));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            new Shapes\Polygon('test', [
                ['x' =>   7, 'y' =>   8],
                ['x' =>  17, 'y' =>  28],
                ['x' =>  -7, 'y' =>  -8],
                ['x' => 107, 'y' => 308],
            ]),
        ]);

        $this->assertEquals(
            [
                1 => [new Kitti\Object('Car', new Shapes\BoundingBox(-7, -8, 107, 308))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithIncompleteLabeledThingsInFrame()
    {
        $task = $this->createLabelingTask(new Model\FrameRange(1, 1));
        $this->createLabeledThingInFrame($task, 1, 'car', [
            new Shapes\Polygon('test', [
                ['x' =>   7, 'y' =>   8],
                ['x' =>  17, 'y' =>  28],
                ['x' =>  -7, 'y' =>  -8],
                ['x' => 107, 'y' => 308],
            ]),
        ]);
        $incompleteThing = $this->createLabeledThingInFrame($task, 1, null, [], true);

        $this->assertEquals(
            [
                1 => [new Kitti\Object('Car', new Shapes\BoundingBox(-7, -8, 107, 308))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
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
        $labeledThingInFrame->setShapesAsObjects($shapes);
        $labeledThingInFrame->setIncomplete($incomplete);

        if ($type !== null) {
            $labeledThingInFrame->setClasses([(string) $type]);
        }

        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }

    /**
     * Sort the result array according to the bounding boxes.
     *
     * This is required because the labeled things are fetched in order of
     * their internal id which is an uuid and therefore their order is
     * unpredictable which is a problem in automated tests.
     *
     * @param array $input
     *
     * @return array
     */
    private function sortResult(array $input)
    {
        $result = [];

        foreach ($input as $frameNumber => $entries) {
            usort(
                $entries,
                function($a, $b) {
                    $aBoundingBox = $a->getBoundingBox();
                    $bBoundingBox = $b->getBoundingBox();

                    if ($aBoundingBox->getLeft() < $bBoundingBox->getLeft()) {
                        return -1;
                    }

                    if ($aBoundingBox->getLeft() > $bBoundingBox->getLeft()) {
                        return 1;
                    }

                    if ($aBoundingBox->getTop() < $bBoundingBox->getTop()) {
                        return -1;
                    }

                    if ($aBoundingBox->getTop() > $bBoundingBox->getTop()) {
                        return 1;
                    }

                    if ($aBoundingBox->getRight() < $bBoundingBox->getRight()) {
                        return -1;
                    }

                    if ($aBoundingBox->getRight() > $bBoundingBox->getRight()) {
                        return 1;
                    }

                    if ($aBoundingBox->getBottom() < $bBoundingBox->getBottom()) {
                        return -1;
                    }

                    if ($aBoundingBox->getBottom() > $bBoundingBox->getBottom()) {
                        return 1;
                    }

                    return 0;
                }
            );

            $result[$frameNumber] = $entries;
        }

        return $result;
    }
}
