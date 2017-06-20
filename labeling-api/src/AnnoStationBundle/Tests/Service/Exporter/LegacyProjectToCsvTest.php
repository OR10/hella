<?php

namespace AnnoStationBundle\Tests\Service\Exporter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Tests\Helper;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Exporter;
use AppBundle\Tests;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;

class LegacyProjectToCsvTest extends Tests\KernelTestCase
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
     * @var Exporter\LegacyProjectToCsv
     */
    private $exporter;

    /**
     * @var Service\CalibrationFileConverter
     */
    private $calibrationFileConverter;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var LabeledThing\FacadeInterface
     */
    private $labeledThingFactory;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreator;

    protected function setUpImplementation()
    {
        $this->videoFacade                      = $this->getAnnostationService('database.facade.video');
        $this->calibrationDataFacade            = $this->getAnnostationService('database.facade.calibration_data');
        $this->projectFacade                    = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade               = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFactory              = $this->getAnnostationService(
            'database.facade.factory.labeled_thing'
        );
        $this->labeledThingInFrameFacadeFactory = $this->getAnnostationService(
            'database.facade.factory.labeled_thing_in_frame'
        );
        $this->exporterFacade                   = $this->getAnnostationService('database.facade.exporter');
        $this->organisationFacade               = $this->getAnnostationService('database.facade.organisation');
        $this->exporter                         = $this->getAnnostationService(
            'service.exporter.legacy_project_to_csv'
        );
        $this->calibrationFileConverter         = $this->getAnnostationService('service.calibration_file_converter');
        $this->taskDatabaseCreator              = $this->getAnnostationService('service.task_database_creator');
        $this->project                          = $this->createProject($this->createOrganisation());
        $this->video                            = $this->createVideo($this->createOrganisation());
    }

    public function pedestrianProvider()
    {
        $csvRowBuilder = Helper\ProjectExportCsvRowBuilder::create();

        return [
            'person instruction with pedestrian drawing tool'  => [
                'drawingTool'      => Model\LabelingTask::DRAWING_TOOL_PEDESTRIAN,
                'labelInstruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                'shapes'           => [
                    new Shapes\Pedestrian('pedestrian-1', 578, 293, 578, 466),
                ],
                'classes'          => ['occlusion-25', 'truncation-25-50', 'direction-front-right'],
                'expected'         => [
                    $csvRowBuilder
                        ->withFrameNumber(1)
                        ->withLabelClass('person')
                        ->withPosition(542, 293)
                        ->withDimensions(71, 173)
                        ->withOcclusion(1)
                        ->withTruncation(2)
                        ->withDirection('front-right')
                        ->build(),
                ],
            ],
            'ignore instruction with rectangle drawing tool'   => [
                'drawingTool'      => Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
                'labelInstruction' => Model\LabelingTask::INSTRUCTION_IGNORE,
                'shapes'           => [
                    new Shapes\Rectangle('pedestrian-1', 332, 284, 440, 391),
                ],
                'classes'          => ['cyclist'],
                'expected'         => [
                    $csvRowBuilder
                        ->withFrameNumber(1)
                        ->withLabelClass('ignore')
                        ->withPosition(332, 284)
                        ->withDimensions(108, 107)
                        ->withOcclusion('unknown')
                        ->withTruncation('unknown')
                        ->withDirection(null)
                        ->build(),
                ],
            ],
            'cyclist instruction with rectangle drawing tool ' => [
                'drawingTool'      => Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
                'labelInstruction' => Model\LabelingTask::INSTRUCTION_CYCLIST,
                'shapes'           => [
                    new Shapes\Rectangle('pedestrian-1', 332, 284, 440, 391),
                ],
                'classes'          => ['occlusion-25', 'truncation-25-50', 'direction-front-right'],
                'expected'         => [
                    $csvRowBuilder
                        ->withFrameNumber(1)
                        ->withLabelClass('cyclist')
                        ->withPosition(332, 284)
                        ->withDimensions(108, 107)
                        ->withOcclusion(1)
                        ->withTruncation(2)
                        ->withDirection('front-right')
                        ->build(),
                ],
            ],
        ];
    }

    public function vehicleProvider()
    {
        $csvRowBuilder = Helper\ProjectExportCsvRowBuilder::create()
            ->withCuboid()
            ->withVertex2d($this->createExampleVertex2d())
            ->withVertex3d($this->createExampleVertex3d());

        return [
            'single occlusion' => [
                'drawingTool'      => Model\LabelingTask::DRAWING_TOOL_CUBOID,
                'labelInstruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                'shapes'           => [$this->createExampleCuboid3d()],
                'classes'          => ['occlusion-25', 'truncation-25-50', 'direction-front-right'],
                'expected'         => [
                    $csvRowBuilder
                        ->withFrameNumber(1)
                        ->withOcclusion(1)
                        ->withTruncation(2)
                        ->withDirection('3d data')
                        ->withCustomFields(
                            [
                                'occlusion_front-back' => '',
                                'occlusion_side'       => '',
                                'vehicleType'          => null,
                            ]
                        )
                        ->build(),
                ],
            ],
            'multi occlusion'  => [
                'drawingTool'      => Model\LabelingTask::DRAWING_TOOL_CUBOID,
                'labelInstruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                'shapes'           => [$this->createExampleCuboid3d()],
                'classes'          => [
                    'front-back-occlusion-25-50',
                    'side-occlusion-50',
                    'truncation-25-50',
                    'direction-front-right',
                ],
                'expected'         => [
                    $csvRowBuilder
                        ->withFrameNumber(1)
                        ->withOcclusion('')
                        ->withTruncation(2)
                        ->withDirection('3d data')
                        ->withCustomFields(
                            [
                                'occlusion_front-back' => 2,
                                'occlusion_side'       => 3,
                                'vehicleType'          => null,
                            ]
                        )
                        ->build(),
                ],
            ],
        ];
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
        $labelingTask = $this->createLabelingTask(range(0, 10), $drawingTool, $labelInstruction);

        $this->createLabeledThingInFrame($labelingTask, 1, 'pedestrian', $classes, $shapes);

        $export = $this->exporter->getPedestrianLabelingData($labelingTask);

        $export = array_map(
            function ($data) {
                unset($data['id']);
                unset($data['uuid']);

                return $data;
            },
            $export
        );

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
        $labelingTask = $this->createLabelingTask(range(0, 10), $drawingTool, $labelInstruction);

        $this->createLabeledThingInFrame($labelingTask, 1, 'pedestrian', $classes, $shapes);

        $export = $this->exporter->getVehicleLabelingData($labelingTask);

        $export = array_map(
            function ($data) {
                unset($data['id']);
                unset($data['uuid']);

                return $data;
            },
            $export
        );

        $this->assertEquals($expected, $export);
    }

    public function testParkedCarsAreExportedInVehicleGroup()
    {
        $classes = ['occlusion-25', 'truncation-25-50', 'direction-front-right'];
        $shapes  = [$this->createExampleCuboid3d()];

        // create required tasks
        $vehicleTask       = $this->createExampleVehicleTask();
        $ignoreVehicleTask = $this->createExampleVehicleIgnoreTask();
        $parkedCarsTask    = $this->createExampleParkedCarsTask();

        // create some labeled things => otherwise we wouldn't have any data to export
        $this->createLabeledThingInFrame($vehicleTask, 1, 'vehicle', $classes, $shapes);
        $this->createLabeledThingInFrame($ignoreVehicleTask, 1, 'ignore-vehicle', $classes, $shapes);
        $this->createLabeledThingInFrame($parkedCarsTask, 1, 'parked-car', $classes, $shapes);

        // set tasks to 'done', otherwise they are not exported
        foreach ([$vehicleTask, $ignoreVehicleTask, $parkedCarsTask] as $task) {
            $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
            $this->labelingTaskFacade->save($task);
        }

        $this->project->addLegacyTaskInstruction(
            Model\LabelingTask::INSTRUCTION_VEHICLE,
            Model\LabelingTask::DRAWING_TOOL_CUBOID
        );
        $this->project->addLegacyTaskInstruction(
            Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
            Model\LabelingTask::DRAWING_TOOL_CUBOID
        );
        $this->project->addLegacyTaskInstruction(
            Model\LabelingTask::INSTRUCTION_PARKED_CARS,
            Model\LabelingTask::DRAWING_TOOL_CUBOID
        );

        // define expectations
        $expectedExportFilename = sprintf(
            'export_%s_vehicle_%s.csv',
            $this->project->getName(),
            $this->video->getName()
        );

        $csvRowBuilder = Helper\ProjectExportCsvRowBuilder::create()->withFrameNumber(1)->withCuboid();

        $expectedParkedCarsRow = $csvRowBuilder
            ->withLabelClass('parked-cars')
            ->withOcclusion('none')
            ->withTruncation('none')
            ->withDirection('3d data')
            ->withVertex2d($this->createExampleVertex2d())
            ->withVertex3d($this->createExampleVertex3d())
            ->withCustomFields(
                [
                    'occlusion-front-back' => 'none',
                    'occlusion-side'       => 'none',
                ]
            )
            ->buildWithStringValues();

        $expectedIgnoreVehicleRow = $csvRowBuilder
            ->withLabelClass('')
            ->withOcclusion('none')
            ->withTruncation('none')
            ->withDirection('none')
            ->withEmptyVertex2d()
            ->withEmptyVertex3d()
            ->withCustomFields(
                [
                    'occlusion-front-back' => 'none',
                    'occlusion-side'       => 'none',
                ]
            )
            ->buildWithStringValues();

        $expectedVehicleRow = $csvRowBuilder
            ->withLabelClass('')
            ->withOcclusion(1)
            ->withTruncation(2)
            ->withDirection('3d data')
            ->withVertex2d($this->createExampleVertex2d())
            ->withVertex3d($this->createExampleVertex3d())
            ->withCustomFields(
                [
                    'occlusion-front-back' => '',
                    'occlusion-side'       => '',
                ]
            )
            ->buildWithStringValues();

        $projectExport = new Model\Export($this->project);
        $this->exporterFacade->save($projectExport);
        $projectExport = $this->exporter->exportProject($projectExport);

        $attachments = array_values($projectExport->getAttachments());

        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');
        file_put_contents($zipFilename, $attachments[0]->getRawData());
        $zip = new \ZipArchive();
        $zip->open($zipFilename);
        $zip->extractTo(sys_get_temp_dir(), array($expectedExportFilename));

        $csvContent = file_get_contents(sys_get_temp_dir() . '/' . $expectedExportFilename);

        $exportedData = $this->mapCsvData($csvContent);
        $this->assertEquals([$expectedParkedCarsRow, $expectedIgnoreVehicleRow, $expectedVehicleRow], $exportedData);
    }

    /**
     * Maps exported csv data to an array of arrays using the first line as keys for the rows.
     *
     * The header row and id columns are excluded in order to have something we can easily compare.
     *
     * @param string $csvData
     *
     * @return array
     */
    private function mapCsvData(string $csvData)
    {
        $mappedCsvData = [];
        $csvRows       = array_map(
            function (string $line) {
                return str_getcsv($line, ',', '"');
            },
            array_filter(
                explode("\n", $csvData),
                function (string $row) {
                    return !empty($row);
                }
            )
        );

        $csvHeader = array_values(array_shift($csvRows));

        foreach ($csvRows as $csvRow) {
            if (empty($csvRow)) {
                continue;
            }
            $mappedRow = array_combine($csvHeader, $csvRow);

            unset($mappedRow['id']);
            unset($mappedRow['uuid']);

            $mappedCsvData[] = $mappedRow;
        }

        return $mappedCsvData;
    }

    /**
     * @return AnnoStationBundleModel\Organisation
     */
    private function createOrganisation()
    {
        return $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));
    }

    /**
     * Create a project for created tasks.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return Model\Project
     */
    private function createProject(AnnoStationBundleModel\Organisation $organisation)
    {
        return $this->projectFacade->save(Model\Project::create('test_project', $organisation));
    }

    /**
     * Create a test video for created tasks.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return Model\Video
     */
    private function createVideo(AnnoStationBundleModel\Organisation $organisation)
    {
        $this->calibrationFileConverter->setCalibrationData(__DIR__ . '/Calibration/Video.csv');

        $this->video = Model\Video::create($organisation, 'test_video');

        $calibrationData = new Model\CalibrationData($this->createOrganisation(), 'test_video');
        $calibrationData->setRawCalibration($this->calibrationFileConverter->getRawData());
        $calibrationData->setCameraMatrix($this->calibrationFileConverter->getCameraMatrix());
        $calibrationData->setRotationMatrix($this->calibrationFileConverter->getRotationMatrix());
        $calibrationData->setTranslation($this->calibrationFileConverter->getTranslation());
        $calibrationData->setDistortionCoefficients($this->calibrationFileConverter->getDistortionCoefficients());
        $this->calibrationDataFacade->save($calibrationData);
        $this->video->setCalibrationId($calibrationData->getId());

        return $this->videoFacade->save($this->video);
    }

    /**
     * Create a labeling task in the database.
     *
     * @param array $frameNumberMapping
     *
     * @param       $drawingTool
     * @param       $labelInstruction
     *
     * @return Model\LabelingTask
     */
    private function createLabelingTask(array $frameNumberMapping, $drawingTool, $labelInstruction)
    {
        $task = Model\LabelingTask::create(
            $this->video,
            $this->project,
            $frameNumberMapping,
            Model\LabelingTask::TYPE_OBJECT_LABELING,
            $drawingTool
        );

        $task->setLabelInstruction($labelInstruction);

        $this->labelingTaskFacade->save($task);

        $this->taskDatabaseCreator->createDatabase($this->project, $task);

        return $task;
    }

    /**
     * Store a labeled thing for the given frame index and the given shapes in the database.
     *
     * @param Model\LabelingTask $task
     * @param int                $frameIndex
     * @param string|null        $type
     * @param array              $classes
     * @param Model\Shape[]      $shapes
     * @param bool               $incomplete
     *
     * @return Model\LabeledThingInFrame
     */
    private function createLabeledThingInFrame(
        Model\LabelingTask $task,
        int $frameIndex,
        string $type = null,
        array $classes = [],
        array $shapes = [],
        bool $incomplete = false
    ) {
        $labeledThingFacade = $this->labeledThingFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );
        $labeledThing       = $labeledThingFacade->save(
            Model\LabeledThing::create($task)
                ->setFrameRange(new Model\FrameIndexRange($frameIndex, $frameIndex))
                ->setClasses($type === null ? [] : [$type])
        );

        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        return $labeledThingInFrameFacade->save(
            Model\LabeledThingInFrame::create($labeledThing, $frameIndex)
                ->setShapes(
                    array_map(
                        function (Model\Shape $shape) {
                            return $shape->toArray();
                        },
                        $shapes
                    )
                )
                ->setIncomplete($incomplete)
                ->setClasses($classes)
        );
    }

    /**
     * @return Shapes\Cuboid3d
     */
    private function createExampleCuboid3d()
    {
        return new Shapes\Cuboid3d(
            'pedestrian-1',
            [16, 6.5, 1.7],
            [16, 4.8, 1.7],
            [16, 4.8, 0],
            [16, 6.5, 0],
            [20, 6.5, 1.7],
            [20, 4.8, 1.7],
            [20, 4.8, 0],
            [20, 6.5, 0]
        );
    }

    /**
     * @return array
     */
    private function createExampleVertex2d()
    {
        return [
            ['x' => 112.8062, 'y' => 285.9309],
            ['x' => 227.0971, 'y' => 285.6820],
            ['x' => 227.4910, 'y' => 405.2159],
            ['x' => 113.3195, 'y' => 404.0596],
            ['x' => 194.2189, 'y' => 289.7364],
            ['x' => 288.7313, 'y' => 289.6006],
            ['x' => 288.9446, 'y' => 386.9826],
            ['x' => 194.5012, 'y' => 386.3510],
        ];
    }

    /**
     * @return array
     */
    private function createExampleVertex3d()
    {
        return [
            ['x' => 16, 'y' => 6.5, 'z' => 1.7],
            ['x' => 16, 'y' => 4.8, 'z' => 1.7],
            ['x' => 16, 'y' => 4.8, 'z' => 0],
            ['x' => 16, 'y' => 6.5, 'z' => 0],
            ['x' => 20, 'y' => 6.5, 'z' => 1.7],
            ['x' => 20, 'y' => 4.8, 'z' => 1.7],
            ['x' => 20, 'y' => 4.8, 'z' => 0],
            ['x' => 20, 'y' => 6.5, 'z' => 0],
        ];
    }

    /**
     * @return Model\LabelingTask
     */
    private function createExampleVehicleTask()
    {
        return $this->createLabelingTask(
            range(0, 10),
            Model\LabelingTask::DRAWING_TOOL_CUBOID,
            Model\LabelingTask::INSTRUCTION_VEHICLE
        );
    }

    /**
     * @return Model\LabelingTask
     */
    private function createExampleVehicleIgnoreTask()
    {
        return $this->createLabelingTask(
            range(0, 10),
            Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
            Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE
        );
    }

    /**
     * @return Model\LabelingTask
     */
    private function createExampleParkedCarsTask()
    {
        return $this->createLabelingTask(
            range(0, 10),
            Model\LabelingTask::DRAWING_TOOL_CUBOID,
            Model\LabelingTask::INSTRUCTION_PARKED_CARS
        );
    }
}
