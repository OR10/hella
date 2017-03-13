<?php

namespace AnnoStationBundle\Tests\Service\TaskExporter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model\Shapes;
use AppBundle\Model\TaskExporter\Kitti;
use AnnoStationBundle\Service\TaskExporter;
use AppBundle\Tests;

class KittiTest extends Tests\KernelTestCase
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
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var TaskExporter\Kitti
     */
    private $exporter;

    protected function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->organisationFacade        = $this->getAnnostationService('database.facade.organisation');
        $this->exporter                  = $this->getAnnostationService('service.task_exporter.kitti');
    }

    public function testExportingTaskWithoutLabeledDataReturnsEmptyZipArchive()
    {
        $task = $this->createLabelingTask(range(1, 10));

        $this->assertEquals(
            array_fill(1, 10, []),
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithOneLabeledThingInOneFrame()
    {
        $task = $this->createLabelingTask(range(0, 8));
        $this->createLabeledThingInFrame(
            $task,
            0,
            'pedestrian',
            [
                new Shapes\Rectangle('test', 10, 10, 100, 100),
            ]
        );

        $this->assertEquals(
            [
                0 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                1 => [],
                2 => [],
                3 => [],
                4 => [],
                5 => [],
                6 => [],
                7 => [],
                8 => [],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithOneLabeledThingWithMultipleShapesInOneFrame()
    {
        $task = $this->createLabelingTask(range(0, 8));
        $this->createLabeledThingInFrame(
            $task,
            0,
            'cyclist',
            [
                new Shapes\Rectangle('test', 10, 10, 100, 100),
                new Shapes\Rectangle('test', 5, 5, 150, 150),
            ]
        );

        $this->assertEquals(
            [
                0 => [new Kitti\Object('Cyclist', new Shapes\BoundingBox(5, 5, 150, 150))],
                1 => [],
                2 => [],
                3 => [],
                4 => [],
                5 => [],
                6 => [],
                7 => [],
                8 => [],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithTwoLabeledThingsWithMultipleShapesInOneFrame()
    {
        $task = $this->createLabelingTask(range(0, 8));
        $this->createLabeledThingInFrame(
            $task,
            0,
            'car',
            [
                new Shapes\Rectangle('test', 10, 10, 100, 100),
                new Shapes\Rectangle('test', 5, 5, 150, 150),
            ]
        );
        $this->createLabeledThingInFrame(
            $task,
            0,
            'pedestrian',
            [
                new Shapes\Rectangle('test', 300, 10, 400, 100),
                new Shapes\Rectangle('test', 290, 5, 350, 95),
            ]
        );

        $this->assertEquals(
            [
                0 => [
                    new Kitti\Object('Car', new Shapes\BoundingBox(5, 5, 150, 150)),
                    new Kitti\Object('Pedestrian', new Shapes\BoundingBox(290, 5, 400, 100)),
                ],
                1 => [],
                2 => [],
                3 => [],
                4 => [],
                5 => [],
                6 => [],
                7 => [],
                8 => [],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithLabeledThingsInMultipleFrames()
    {
        $task = $this->createLabelingTask(range(0, 8));

        foreach (range(4, 8) as $frameNumber) {
            $this->createLabeledThingInFrame(
                $task,
                $frameNumber,
                'pedestrian',
                [
                    new Shapes\Rectangle('test', 10, 10, 100, 100),
                ]
            );
        }

        $this->assertEquals(
            [
                0 => [],
                1 => [],
                2 => [],
                3 => [],
                4 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                5 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                6 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                7 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
                8 => [new Kitti\Object('Pedestrian', new Shapes\BoundingBox(10, 10, 100, 100))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithEllipseShapeInOneFrame()
    {
        $task = $this->createLabelingTask(range(0, 0));
        $this->createLabeledThingInFrame(
            $task,
            0,
            'car',
            [
                new Shapes\Ellipse('test', 10, 10, 100, 10),
            ]
        );

        $this->assertEquals(
            [
                0 => [new Kitti\Object('Car', new Shapes\BoundingBox(10, 10, 110, 20))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithPolygonShapeInOneFrame()
    {
        $task = $this->createLabelingTask(range(0, 0));
        $this->createLabeledThingInFrame(
            $task,
            0,
            'car',
            [
                new Shapes\Polygon(
                    'test',
                    [
                        ['x' => 7, 'y' => 8],
                        ['x' => 17, 'y' => 28],
                        ['x' => -7, 'y' => -8],
                        ['x' => 107, 'y' => 308],
                    ]
                ),
            ]
        );

        $this->assertEquals(
            [
                0 => [new Kitti\Object('Car', new Shapes\BoundingBox(-7, -8, 107, 308))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    public function testExportingTaskWithIncompleteLabeledThingsInFrame()
    {
        $task = $this->createLabelingTask(range(0, 0));
        $this->createLabeledThingInFrame(
            $task,
            0,
            'car',
            [
                new Shapes\Polygon(
                    'test',
                    [
                        ['x' => 7, 'y' => 8],
                        ['x' => 17, 'y' => 28],
                        ['x' => -7, 'y' => -8],
                        ['x' => 107, 'y' => 308],
                    ]
                ),
            ]
        );
        $incompleteThing = $this->createLabeledThingInFrame($task, 0, null, [], true);

        $this->assertEquals(
            [
                0 => [new Kitti\Object('Car', new Shapes\BoundingBox(-7, -8, 107, 308))],
            ],
            $this->sortResult($this->exporter->getInternalExportData($task))
        );
    }

    /**
     * Create a labeling task in the database.
     *
     * @param array $frameNumberMapping
     *
     * @return Model\LabelingTask
     */
    private function createLabelingTask(array $frameNumberMapping)
    {
        $oganisation = new AnnoStationBundleModel\Organisation('Test Oganisation');
        return $this->labelingTaskFacade->save(
            Model\LabelingTask::create(
                $this->videoFacade->save(Model\Video::create($oganisation, 'test video')),
                $this->projectFacade->save(Model\Project::create('test project', $oganisation)),
                $frameNumberMapping,
                Model\LabelingTask::TYPE_OBJECT_LABELING
            )
        );
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
        $frameRange   = new Model\FrameIndexRange(
            min($task->getFrameNumberMapping()),
            max($task->getFrameNumberMapping())
        );
        $labeledThing = $this->labeledThingFacade->save(
            Model\LabeledThing::create($task)
                ->setFrameRange($frameRange)
                ->setClasses($type === null ? [] : [(string) $type])
        );

        return $this->labeledThingInFrameFacade->save(
            Model\LabeledThingInFrame::create($labeledThing, $frameNumber)
                ->setShapesAsObjects($shapes)
                ->setIncomplete($incomplete)
        );
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
                function ($a, $b) {
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
