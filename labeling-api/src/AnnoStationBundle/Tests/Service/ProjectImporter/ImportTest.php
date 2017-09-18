<?php

namespace AnnoStationBundle\Tests\Service\ProjectImporter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Tests\Helper\OrganisationBuilder;
use AnnoStationBundle\Worker\JobInstruction;
use AnnoStationBundle\Worker\Jobs;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;
use AnnoStationBundle\Database\Facade\LabeledThingGroupInFrame;
use AnnoStationBundle\Database\Facade\LabeledFrame;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AppBundle\Tests;
use crosscan\Logger;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;

class ImportTest extends Tests\KernelTestCase
{
    /**
     * @var Service\ProjectImporter\Import
     */
    private $projectImporterService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var WorkerPool\Facade
     */
    private $workerPoolFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var LabeledThing\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    /**
     * @var LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var LabeledThingGroup\FacadeInterface
     */
    private $labeledThingGroupFacadeFactory;

    /**
     * @var LabeledThingGroupInFrame\FacadeInterface
     */
    private $labeledThingGroupInFrameFacadeFactory;

    /**
     * @var LabeledFrame\FacadeInterface
     */
    private $labeledFrameFacadeFactory;

    public function testImport()
    {
        $organisation = $this->organisationFacade->save(OrganisationBuilder::create()->build());
        $jobs         = [];
        $this->workerPoolFacade->expects($this->any())->method('addJob')->with(
            $this->callback(
                function ($job) use (&$jobs) {
                    if ($job instanceof Jobs\ThingImporter) {
                        $jobs['ThingImporter'][] = $job;

                        return true;
                    } elseif ($job instanceof Jobs\VideoFrameSplitter) {
                        $jobs['VideoFrameSplitter'][] = $job;

                        return true;
                    }

                    return false;
                }
            )
        );

        $tasks = $this->projectImporterService->importXml(
            __DIR__ . '/TestFiles/SMPC16C00103_SE-OOX687_20150629_185715_rgb_c.avi.xml',
            $organisation,
            $this->defaultUser
        );

        $project = $this->projectFacade->findByName('Das wird ein Test');

        $this->assertInstanceOf('AppBundle\Model\Project', $project);

        $taskConfigurationId = $project->getRequirementsXmlTaskInstructions()[0]['taskConfigurationId'];

        $taskConfiguration = $this->taskConfigurationFacade->find($taskConfigurationId);

        $this->assertEquals(
            file_get_contents(__DIR__ . '/TestFiles/TestConfig.xml'),
            $taskConfiguration->getRawData()
        );

        $firstTask = reset($tasks);

        $this->assertInstanceOf('AppBundle\Model\LabelingTask', $firstTask);

        $this->assertCount(2, $jobs['VideoFrameSplitter']);
        $this->assertCount(1, $jobs['ThingImporter']);
    }

    public function provider()
    {
        return [
            [
                'file' => __DIR__ . '/TestFiles/SMPC16C00103_SE-OOX687_20150629_185715_rgb_c.avi.xml',
                'labeledThings' => [
                    [
                        'frameRange' => new Model\FrameIndexRange(0, 3),
                        'incomplete' => false,
                        'lineColor' => '2',
                        'originalId' => '936f01d0baf669cc0daad101ca8fbfdd',
                    ],
                    [
                        'frameRange' => new Model\FrameIndexRange(0, 0),
                        'incomplete' => false,
                        'lineColor' => '5',
                        'originalId' => '936f01d0baf669cc0daad101ca8fe155',
                    ],
                    [
                        'frameRange' => new Model\FrameIndexRange(0, 2),
                        'incomplete' => false,
                        'lineColor' => '3',
                        'originalId' => '936f01d0baf669cc0daad101ca8fe323',
                    ],
                    [
                        'frameRange' => new Model\FrameIndexRange(0, 0),
                        'incomplete' => false,
                        'lineColor' => '4',
                        'originalId' => '936f01d0baf669cc0daad101ca8ffc16',
                    ],
                ],
                'labeledThingsInFrames' => [
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8fbfdd',
                        'frameIndex' => 0,
                        'classes' => ['u-turn', 'germany'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => 'bb8152af-c2dd-4cfc-96a9-5cd91aeaba5f',
                                'type' => 'cuboid3d',
                                'vehicleCoordinates' => [
                                    [5.6963, -0.0126, 1],
                                    [5.6963, -2.0126, 1],
                                    [5.6963, -2.0126, 0],
                                    [5.6963, -0.0126, 0],
                                    [6.6963, -0.0126, 1],
                                    [6.6963, -2.0126, 1],
                                    [6.6963, -2.0126, 0],
                                    [6.6963, -0.0126, 0],
                                ]
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'sign',
                        'ghost' => false,

                    ],
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8fbfdd',
                        'frameIndex' => 1,
                        'classes' => ['u-turn', 'germany'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => 'bb8152af-c2dd-4cfc-96a9-5cd91aeaba5f',
                                'type' => 'cuboid3d',
                                'vehicleCoordinates' => [
                                    [6.2969, 0.4179, 1],
                                    [6.2969, -1.5821, 1],
                                    [6.2969, -1.5821, 0],
                                    [6.2969, 0.4179, 0],
                                    [7.2969, 0.4179, 1],
                                    [7.2969, -1.5821, 1],
                                    [7.2969, -1.5821, 0],
                                    [7.2969, 0.4179, 0],
                                ]
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'sign',
                        'ghost' => false,

                    ],
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8fbfdd',
                        'frameIndex' => 2,
                        'classes' => ['u-turn', 'germany'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => 'bb8152af-c2dd-4cfc-96a9-5cd91aeaba5f',
                                'type' => 'cuboid3d',
                                'vehicleCoordinates' => [
                                    [8.3345, 3.1989, 1],
                                    [8.3345, 1.1989, 1],
                                    [8.3345, 1.1989, 0],
                                    [8.3345, 3.1989, 0],
                                    [9.3345, 3.1989, 1],
                                    [9.3345, 1.1989, 1],
                                    [9.3345, 1.1989, 0],
                                    [9.3345, 3.1989, 0],
                                ]
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'sign',
                        'ghost' => false,

                    ],
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8fbfdd',
                        'frameIndex' => 3,
                        'classes' => ['u-turn', 'germany'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => 'bb8152af-c2dd-4cfc-96a9-5cd91aeaba5f',
                                'type' => 'cuboid3d',
                                'vehicleCoordinates' => [
                                    [10.1816, 4.4072, 1],
                                    [10.1816, 2.4072, 1],
                                    [10.1816, 2.4072, 0],
                                    [10.1816, 4.4072, 0],
                                    [11.1816, 4.4072, 1],
                                    [11.1816, 2.4072, 1],
                                    [11.1816, 2.4072, 0],
                                    [11.1816, 4.4072, 0],
                                ]
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'sign',
                        'ghost' => false,

                    ],
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8fe155',
                        'frameIndex' => 0,
                        'classes' => ['abc', 'abc2', 'abc3', '30', 'time-limit-start-8', 'time-limit-end-8'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => '7d670d47-55b0-4b2a-9262-f051dfcb1a4e',
                                'type' => 'rectangle',
                                'topLeft' => ['x' => 333, 'y' => 219],
                                'bottomRight' => ['x' => 631, 'y' => 380],
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'time-range-sign',
                        'ghost' => false,

                    ],
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8fe323',
                        'frameIndex' => 0,
                        'classes' => ['hat-yes'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => '74902e81-8596-4a35-8785-8725c7e7bb29',
                                'type' => 'pedestrian',
                                'topCenter' => ['x' => 48, 'y' => 36],
                                'bottomCenter' => ['x' => 48, 'y' => 240],
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'person',
                        'ghost' => false,

                    ],
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8fe323',
                        'frameIndex' => 1,
                        'classes' => ['hat-yes'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => '74902e81-8596-4a35-8785-8725c7e7bb29',
                                'type' => 'pedestrian',
                                'topCenter' => ['x' => 49, 'y' => 36],
                                'bottomCenter' => ['x' => 49, 'y' => 240],
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'person',
                        'ghost' => false,

                    ],
                    [
                        'originalLabeledThingId' => '936f01d0baf669cc0daad101ca8ffc16',
                        'frameIndex' => 0,
                        'classes' => ['lane-yes'],
                        'ghostClasses' => null,
                        'shapes' => [
                            [
                                'id' => 'b06c5d50-a6cb-459f-9359-2b350c970246',
                                'type' => 'polygon',
                                'points' => [
                                    ['x' => 171, 'y' => 572],
                                    ['x' => 418, 'y' => 532],
                                    ['x' => 391, 'y' => 486],
                                    ['x' => 391, 'y' => 472],
                                    ['x' => 392, 'y' => 474],
                                    ['x' => 391, 'y' => 473],
                                ]
                            ]
                        ],
                        'incomplete' => false,
                        'identifierName' => 'lane',
                        'ghost' => false,

                    ],
                ],
                'labeledThingGroups' => [
                    [
                        'originalId' => 'cf6a96bdee95412f3309e2a62b26bc2f',
                        'groupType' => 'extension-sign-group',
                        'lineColor' => '7',
                        'labeledThingGroupInFrames' => [
                            [
                                'classes' => ['position-above'],
                                'frameIndex' => 2,
                            ],
                            [
                                'classes' => ['position-below'],
                                'frameIndex' => 0,
                            ],
                        ]
                    ]
                ],
                'labeledFrames' => [
                    [
                        'frameIndex' => 0,
                        'classes' => ['day', 'germany'],
                        'ghostClasses' => null,
                        'incomplete' => false,
                    ]
                ],
            ]
        ];
    }

    /**
     * @dataProvider provider
     *
     * @param $file
     * @param $expectedLabeledThings
     * @param $expectedLabeledThingsInFrames
     * @param $expectedLabeledThingGroups
     * @param $expectedLabeledFrames
     */
    public function testThingImportWorker($file, $expectedLabeledThings, $expectedLabeledThingsInFrames, $expectedLabeledThingGroups, $expectedLabeledFrames)
    {
        $organisation = $this->organisationFacade->save(OrganisationBuilder::create()->build());

        $tasks = $this->projectImporterService->importXml(
            $file,
            $organisation,
            $this->defaultUser
        );

        $job = new Jobs\ThingImporter(
            $file,
            $this->getTasksFrameMapping($tasks)
        );

        /** @var JobInstruction\ThingImporter $thingImporterJobInstruction */
        $thingImporterJobInstruction = $this->getAnnostationService('worker.job_instruction.thing_importer');

        /** @var Logger\Facade\LoggerFacade $loggerFacadeMock */
        $loggerFacadeMock = $this->getMockBuilder(Logger\Facade\LoggerFacade::class)
            ->disableOriginalConstructor()
            ->getMock();

        $thingImporterJobInstruction->run($job, $loggerFacadeMock);

        $task = $tasks[0];

        $labelingThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $labelingThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $labelingThingGroupFacade = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $labelingThingGroupInFrameFacade = $this->labeledThingGroupInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $labelingFrameFacade = $this->labeledFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $task->getId()
        );

        $labeledThings = $labelingThingFacade->findByTaskId($task);

        $this->assertEquals(4, count($labeledThings));

        $actualLabeledThings = array_map(function (Model\LabeledThing $labeledThing) {
            return [
                'frameRange' => $labeledThing->getFrameRange(),
                'incomplete' => $labeledThing->getIncomplete(),
                'lineColor' => $labeledThing->getLineColor(),
                'originalId' => $labeledThing->getOriginalId(),
            ];
        }, $labeledThings);

        $this->assertEquals($expectedLabeledThings, $actualLabeledThings);

        $labeledThingInFrames = $labelingThingInFrameFacade->getLabeledThingsInFrame($task);

        $actualLabeledThingInFrames = array_map(function (Model\LabeledThingInFrame $labeledThingInFrame) use ($labelingThingFacade) {
            $labeledThing = $labelingThingFacade->find($labeledThingInFrame->getLabeledThingId());
            return [
                'originalLabeledThingId' => $labeledThing->getOriginalId(),
                'frameIndex' => $labeledThingInFrame->getFrameIndex(),
                'classes' => $labeledThingInFrame->getClasses(),
                'ghostClasses' => $labeledThingInFrame->getGhostClasses(),
                'shapes' => $labeledThingInFrame->getShapes(),
                'incomplete' => $labeledThingInFrame->getIncomplete(),
                'identifierName' => $labeledThingInFrame->getIdentifierName(),
                'ghost' => $labeledThingInFrame->isGhost(),
            ];
        }, $labeledThingInFrames);

        $this->assertEquals($expectedLabeledThingsInFrames, $actualLabeledThingInFrames);

        $labeledThingGroups = $labelingThingGroupFacade->getLabeledThingGroupsByTask($task);

        $actualLabeledThingGroups = array_map(function (AnnoStationBundleModel\LabeledThingGroup $labeledThingGroup) use ($labelingThingGroupInFrameFacade) {

            $labeledThingGroupInFrames = array_map(function(AnnoStationBundleModel\LabeledThingGroupInFrame $labeledThingGroupInFrame) {
                return [
                    'classes' => $labeledThingGroupInFrame->getClasses(),
                    'frameIndex' => $labeledThingGroupInFrame->getFrameIndex(),
                ];
            }, $labelingThingGroupInFrameFacade->getLabeledThingGroupInFramesForLabeledThingGroup($labeledThingGroup));
            return [
                'originalId' => $labeledThingGroup->getOriginalId(),
                'groupType' => $labeledThingGroup->getGroupType(),
                'lineColor' => $labeledThingGroup->getLineColor(),
                'labeledThingGroupInFrames' => $labeledThingGroupInFrames,
            ];
        }, $labeledThingGroups);
        $this->assertEquals($expectedLabeledThingGroups, $actualLabeledThingGroups);

        $labeledFrames = $labelingFrameFacade->findBylabelingTask($task);

        $actualLabeledFrames = array_map(function (Model\LabeledFrame $labeledFrame) {
            return [
                'frameIndex' => $labeledFrame->getFrameIndex(),
                'classes' => $labeledFrame->getClasses(),
                'ghostClasses' => $labeledFrame->getGhostClasses(),
                'incomplete' => $labeledFrame->getIncomplete(),
            ];
        }, $labeledFrames);
        $this->assertEquals($expectedLabeledFrames, $actualLabeledFrames);
    }

    private function getTasksFrameMapping(array $tasks)
    {
        $taskFrameMapping = [];
        /** @var Model\LabelingTask $task */
        foreach ($tasks as $task) {
            $taskFrameNumberMapping = $task->getFrameNumberMapping();
            $start                  = min($taskFrameNumberMapping);
            $end                    = max($taskFrameNumberMapping);
            $frameRange             = range($start, $end);
            foreach ($frameRange as $frame) {
                $taskFrameMapping[$frame] = $task->getId();
            }
        }

        return $taskFrameMapping;
    }

    public function setUpImplementation()
    {
        $this->workerPoolFacade = $this->getMockBuilder(AMQP\FacadeAMQP::class)
            ->disableOriginalConstructor()
            ->getMock();
        $this->getContainer()->set(
            sprintf(self::ANNOSTATION_SERVICE_PATTERN, 'vendor.worker_pool.amqp'),
            $this->workerPoolFacade
        );

        $this->projectImporterService                = $this->getAnnostationService('service.project_importer.import');
        $this->organisationFacade                    = $this->getAnnostationService('database.facade.organisation');
        $this->projectFacade                         = $this->getAnnostationService('database.facade.project');
        $this->labeledThingFacadeFactory             = $this->getAnnostationService('database.facade.factory.labeled_thing');
        $this->labeledThingInFrameFacadeFactory      = $this->getAnnostationService('database.facade.factory.labeled_thing_in_frame');
        $this->labeledThingGroupFacadeFactory        = $this->getAnnostationService('database.facade.factory.labeled_thing_group');
        $this->labeledThingGroupInFrameFacadeFactory = $this->getAnnostationService('database.facade.factory.labeled_thing_group_in_frame');
        $this->labeledFrameFacadeFactory             = $this->getAnnostationService('database.facade.factory.labeled_frame');
        $this->taskConfigurationFacade               = $this->getAnnostationService('database.facade.task_configuration');
        $this->createDefaultUser();
    }
}
