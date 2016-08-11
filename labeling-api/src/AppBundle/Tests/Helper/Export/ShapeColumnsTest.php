<?php

namespace AppBundle\Tests\Helper\Export;

use AppBundle\Service;
use AppBundle\Tests;
use AppBundle\Helper;
use AppBundle\Model;
use AppBundle\Helper\Export\Column;

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
            'topLeft'               => array('x' => 123, 'y' => '456'),
            'bottomRight'           => array('x' => 789, 'y' => '1012'),
        );

        $this->project                            = $this->createProject('project-id-1');
        $this->video                              = $this->createVideo('video-id-1');
        $this->task                               = $this->createTask($this->project, $this->video);
        $this->labeledThing                       = $this->createLabeledThing($this->task);

        $this->labeledThingsInFrames = array();
        $this->labeledThingsInFrames['rectangle'] = $this->createLabeledThingInFrame(
            $this->labeledThing,
            23,
            array($rectangleShape)
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
            $this->labeledThingsInFrames[$drawingTool]
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
                return $column->getHeader();
            },
            $columns
        );

        $this->assertEquals(
            $headers,
            array_keys($expectedValues)
        );
    }
}