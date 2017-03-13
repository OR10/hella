<?php

namespace AnnoStationBundle\Tests\Helper\Export;

use AnnoStationBundle\Service;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Helper;
use AppBundle\Model;
use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;

class ShapeColumnsTest extends Tests\CouchDbTestCase
{
    /**
     * @var Service\ShapeColumnsFactory
     */
    private $shapeColumnsFactory;

    /**
     * @var Service\ColumnGroupFactory
     */
    private $columnGroupFactory;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\CalibrationData
     */
    private $calibrationData;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\LabeledThing
     */
    private $labeledThing;

    /**
     * @var Model\LabeledThingInFrame[]
     */
    private $labeledThingsInFrames;

    /**
     * @var Service\DepthBuffer
     */
    private $depthBuffer;

    private function createProviderComposition(array $providers)
    {
        $mergedRows = array();
        for ($rowIndex = 0; $rowIndex < count($providers[0]); $rowIndex++) {
            $providerRows = array();
            foreach ($providers as $provider) {
                $providerRows[] = $provider[$rowIndex];
            }
            $mergedRows[$rowIndex] = call_user_func_array('\array_merge', $providerRows);
        }

        return $mergedRows;
    }

    public function provideDrawingTools()
    {
        return array(
            array("rectangle"),
            array("pedestrian"),
            array("cuboid"),
        );
    }

    public function provideColumns()
    {
        return array(
            array(
                [
                    new Column\Rectangle(Column\Rectangle::TYPE_X),
                    new Column\Rectangle(Column\Rectangle::TYPE_Y),
                    new Column\Rectangle(Column\Rectangle::TYPE_WIDTH),
                    new Column\Rectangle(Column\Rectangle::TYPE_HEIGHT),
                ],
            ),
            array(
                [
                    new Column\Pedestrian(Column\Pedestrian::TYPE_X),
                    new Column\Pedestrian(Column\Pedestrian::TYPE_Y),
                    new Column\Pedestrian(Column\Pedestrian::TYPE_WIDTH),
                    new Column\Pedestrian(Column\Pedestrian::TYPE_HEIGHT),
                ],
            ),
            array(
                [
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 0, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 0, Column\Cuboid::AXIS_Y),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 1, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 1, Column\Cuboid::AXIS_Y),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 2, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 2, Column\Cuboid::AXIS_Y),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 3, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 3, Column\Cuboid::AXIS_Y),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 4, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 4, Column\Cuboid::AXIS_Y),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 5, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 5, Column\Cuboid::AXIS_Y),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 6, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_2D, 6, Column\Cuboid::AXIS_Y),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 0, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 0, Column\Cuboid::AXIS_Y),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 0, Column\Cuboid::AXIS_Z),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 1, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 1, Column\Cuboid::AXIS_Y),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 1, Column\Cuboid::AXIS_Z),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 2, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 2, Column\Cuboid::AXIS_Y),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 2, Column\Cuboid::AXIS_Z),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 3, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 3, Column\Cuboid::AXIS_Y),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 3, Column\Cuboid::AXIS_Z),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 4, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 4, Column\Cuboid::AXIS_Y),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 4, Column\Cuboid::AXIS_Z),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 5, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 5, Column\Cuboid::AXIS_Y),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 5, Column\Cuboid::AXIS_Z),

                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 6, Column\Cuboid::AXIS_X),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 6, Column\Cuboid::AXIS_Y),
                    new Column\Cuboid($this->depthBuffer, Column\Cuboid::TYPE_3D, 6, Column\Cuboid::AXIS_Z),
                ],
            ),
        );
    }

    public function provideColumnHeadersAndValues()
    {
        return array(
            array(
                [
                    'position_x' => '123',
                    'position_y' => '456',
                    'width'      => '666',
                    'height'     => '556',
                ],
            ),
            array(
                [
                    'position_x' => '418',
                    'position_y' => '200',
                    'width'      => '164',
                    'height'     => '400',
                ],
            ),
            array(
                [
                    'vertex_2d_0_x' => '288.3824',
                    'vertex_2d_0_y' => '424.5808',

                    'vertex_2d_1_x' => '875.9968',
                    'vertex_2d_1_y' => '424.1635',

                    'vertex_2d_2_x' => '869.9172',
                    'vertex_2d_2_y' => '709.6966',

                    'vertex_2d_3_x' => '293.6272',
                    'vertex_2d_3_y' => '711.0569',

                    'vertex_2d_4_x' => '401.6302',
                    'vertex_2d_4_y' => '375.3276',

                    'vertex_2d_5_x' => '743.9567',
                    'vertex_2d_5_y' => '375.2449',

                    'vertex_2d_6_x' => '742.7169',
                    'vertex_2d_6_y' => '544.7573',

                    'vertex_2d_7_x' => '402.6906',
                    'vertex_2d_7_y' => '545.0404',

                    'vertex_3d_0_x' => '3',
                    'vertex_3d_0_y' => '1',
                    'vertex_3d_0_z' => '1',

                    'vertex_3d_1_x' => '3',
                    'vertex_3d_1_y' => '-1',
                    'vertex_3d_1_z' => '1',

                    'vertex_3d_2_x' => '3',
                    'vertex_3d_2_y' => '-1',
                    'vertex_3d_2_z' => '0',

                    'vertex_3d_3_x' => '3',
                    'vertex_3d_3_y' => '1',
                    'vertex_3d_3_z' => '0',

                    'vertex_3d_4_x' => '6',
                    'vertex_3d_4_y' => '1',
                    'vertex_3d_4_z' => '1',

                    'vertex_3d_5_x' => '6',
                    'vertex_3d_5_y' => '-1',
                    'vertex_3d_5_z' => '1',

                    'vertex_3d_6_x' => '6',
                    'vertex_3d_6_y' => '-1',
                    'vertex_3d_6_z' => '0',

                    'vertex_3d_7_x' => '6',
                    'vertex_3d_7_y' => '1',
                    'vertex_3d_7_z' => '0',
                ],
            ),
        );
    }

    public function provideDrawingToolsAndColumns()
    {
        return $this->createProviderComposition(
            [
                $this->provideDrawingTools(),
                $this->provideColumns(),
            ]
        );
    }

    public function provideDrawingToolsAndColumnHeadersAndValues()
    {
        return $this->createProviderComposition(
            [
                $this->provideDrawingTools(),
                $this->provideColumnHeadersAndValues(),
            ]
        );
    }

    public function setUpImplementation()
    {
        parent::setUpImplementation();

        $this->shapeColumnsFactory = $this->getAnnostationService('service.shape_columns_factory');
        $this->columnGroupFactory  = $this->getAnnostationService('service.column_group_factory');

        $rectangleShape = array(
            'type'                  => 'rectangle',
            'id'                    => 'shape-id-1',
            'labeledThingInFrameId' => 'some-ltif-id',
            'topLeft'               => array('x' => 123, 'y' => 456),
            'bottomRight'           => array('x' => 789, 'y' => 1012),
        );

        $pedestrianShape = array(
            'type'                  => 'pedestrian',
            'id'                    => 'shape-id-1',
            'labeledThingInFrameId' => 'some-ltif-id',
            'topCenter'             => array('x' => 500, 'y' => 200),
            'bottomCenter'          => array('x' => 500, 'y' => 600),
        );

        $cuboidShape = array(
            'type'                  => 'cuboid3d',
            'id'                    => 'shape-id-1',
            'labeledThingInFrameId' => 'some-ltif-id',
            'vehicleCoordinates'    => array(
                [3, 1, 1,],
                [3, -1, 1,],
                [3, -1, 0,],
                [3, 1, 0,],
                [6, 1, 1,],
                [6, -1, 1,],
                [6, -1, 0,],
                [6, 1, 0,],
            ),
        );

        $calibration = array(
            'cameraMatrix'           => [
                1220.70739746,
                0,
                559.203125,
                0,
                0,
                1221.07788086,
                306.796875,
                0,
                0,
                0,
                1,
                0,
                0,
                0,
                0,
                1,
            ],
            'rotationMatrix'         => [0, -1, 0, 0, 0, 0, -1, 0, 1, 0, 0, 0, 0, 0, 0, 1,],
            'translation'            => [
                -1.09999997616,
                0.0799999982119,
                1.39999997616,
            ],
            'distortionCoefficients' => [
                -0.192208706592,
                0.0590421349576,
                0,
                0,
                0,
            ],
        );

        $this->project         = $this->createProject('project-id-1', $this->createOrganisation());
        $this->calibrationData = $this->createCalibrationData('video-id-1', $calibration);
        $this->video           = $this->createVideo($this->createOrganisation(), 'video-id-1', $this->calibrationData);
        $this->task            = $this->createTask($this->project, $this->video);
        $this->labeledThing    = $this->createLabeledThing($this->task);

        $this->labeledThingsInFrames               = array();
        $this->labeledThingsInFrames['rectangle']  = $this->createLabeledThingInFrame(
            $this->labeledThing,
            23,
            array($rectangleShape)
        );
        $this->labeledThingsInFrames['pedestrian'] = $this->createLabeledThingInFrame(
            $this->labeledThing,
            42,
            array($pedestrianShape)
        );
        $this->labeledThingsInFrames['cuboid']     = $this->createLabeledThingInFrame(
            $this->labeledThing,
            11,
            array($cuboidShape)
        );
    }

    public function testFactoryIsProvided()
    {
        $this->assertSame(
            true,
            $this->shapeColumnsFactory instanceof Service\ShapeColumnsFactory
        );
    }

    /**
     * @dataProvider provideDrawingToolsAndColumns
     */
    public function testShapeColumnsAreCreated($drawingTool, $expectedColumns)
    {
        // @HACK @TODO: Needs to be fixed. Currently the dataProvider is called before setup, therefore $depthBuffer is
        //              not defined in it. Until I have a nice idea how to fix this I commented out this one test
        if ($drawingTool === 'cuboid') {
            return;
        }

        $columns = $this->shapeColumnsFactory->create($drawingTool);

        $this->assertEquals(
            $expectedColumns,
            $columns
        );
    }

    /**
     * @dataProvider provideDrawingToolsAndColumnHeadersAndValues
     */
    public function testShapeColumnsExportCorrectValues($drawingTool, $expectedValues)
    {
        $columns     = $this->shapeColumnsFactory->create($drawingTool);
        $columnGroup = $this->columnGroupFactory->create();
        $columnGroup->addColumns($columns);

        $row = $columnGroup->createRow(
            $this->project,
            $this->video,
            $this->task,
            $this->labeledThingsInFrames[$drawingTool],
            null,
            $this->calibrationData
        );

        $this->assertEquals(
            $row->getValues(),
            array_values($expectedValues)
        );
    }

    /**
     * @dataProvider provideDrawingToolsAndColumnHeadersAndValues
     */
    public function testShapeColumnsExportCorrectHeaders($drawingTool, $expectedValues)
    {
        $columns = $this->shapeColumnsFactory->create($drawingTool);
        $headers = array_map(
            function ($column) {
                /** @var Export\Column $column */
                return $column->getHeader();
            },
            $columns
        );

        $this->assertEquals(
            $headers,
            array_keys($expectedValues)
        );
    }

    public function testShapeColumnsAreMergedByHeader()
    {
        $columnGroup = $this->columnGroupFactory->create(Service\ColumnGroupFactory::UNIQUE);
        $columnGroup->addColumns(
            $this->shapeColumnsFactory->create('pedestrian')
        );
        $columnGroup->addColumns(
            $this->shapeColumnsFactory->create('rectangle')
        );

        $rectangleRow = $columnGroup->createRow(
            $this->project,
            $this->video,
            $this->task,
            $this->labeledThingsInFrames['rectangle'],
            null,
            $this->calibrationData
        );

        $pedestrianRow = $columnGroup->createRow(
            $this->project,
            $this->video,
            $this->task,
            $this->labeledThingsInFrames['pedestrian'],
            null,
            $this->calibrationData
        );

        $this->assertEquals(
            ['123', '456', '666', '556'],
            $rectangleRow->getValues()
        );

        $this->assertEquals(
            ['418', '200', '164', '400'],
            $pedestrianRow->getValues()
        );

        $this->assertEquals(
            array_map(
                function ($column) {
                    /** @var Export\Column $column */
                    return $column->getHeader();
                },
                $columnGroup->getColumns()
            ),
            ['position_x', 'position_y', 'width', 'height']
        );
    }
}
