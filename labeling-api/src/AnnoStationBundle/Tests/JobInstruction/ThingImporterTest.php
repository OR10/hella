<?php

namespace AnnoStationBundle\Tests\JobInstruction;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Model;
use AnnoStationBundle\Worker\Jobs;
use AnnoStationBundle\Worker\JobInstruction;
use AppBundle\Tests;
use crosscan\Logger\Facade as CrosscanLoggerFacade;

class ThingImporterTest extends Tests\KernelTestCase
{

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var JobInstruction\ThingImporter
     */
    private $thingImportJobInstruction;

    /**
     * @var
     */
    private $logger;

    /**
     * @var Facade\LabeledThing\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    /**
     * @var Facade\LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var Facade\LabeledFrame\FacadeInterface
     */
    private $labeledFrameFacadeFactory;

    /**
     * @var Facade\LabeledThingGroup\FacadeInterface
     */
    private $labeledThingGroupFacadeFactory;

    protected function setUpImplementation()
    {
        $this->createDefaultUser();
        $videoFacade                     = $this->getAnnostationService('database.facade.video');
        $projectFacade                   = $this->getAnnostationService('database.facade.project');
        $taskFacade                      = $this->getAnnostationService('database.facade.labeling_task');
        $taskConfigurationFacade         = $this->getAnnostationService('database.facade.task_configuration');
        $taskDatabaseCreator             = $this->getAnnostationService('service.task_database_creator');
        $this->thingImportJobInstruction = $this->getAnnostationService('worker.job_instruction.thing_importer');
        $this->logger                    = $this->getMockBuilder(CrosscanLoggerFacade\LoggerFacade::class)
            ->disableOriginalConstructor()
            ->getMock();

        $this->labeledThingFacadeFactory        = $this->getAnnostationService('database.facade.factory.labeled_thing');
        $this->labeledThingInFrameFacadeFactory = $this->getAnnostationService(
            'database.facade.factory.labeled_thing_in_frame'
        );
        $this->labeledFrameFacadeFactory        = $this->getAnnostationService('database.facade.factory.labeled_frame');
        $this->labeledThingGroupFacadeFactory   = $this->getAnnostationService(
            'database.facade.factory.labeled_thing_group'
        );

        $organisation    = Helper\OrganisationBuilder::create()->build();
        $requirementsXml = $taskConfigurationFacade->save(
            Helper\TaskConfigurationRequirementsBuilder::create(
                $organisation,
                file_get_contents(__DIR__ . '/../Resources/TaskConfigurations/requirements_meta_thinglabeling.xml'),
                $this->defaultUser->getId()
            )->build()
        );
        $project         = $projectFacade->save(
            Helper\ProjectBuilder::create($organisation)
                ->withFrameSkip(22)
                ->withStartFrameNumber(22)
                ->build()
        );
        $video           = $videoFacade->save(Helper\VideoBuilder::create($organisation)->build());
        $this->task      = $taskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)
                ->withFrameNumberMapping(range(1, 660))
                ->withTaskConfiguration($requirementsXml)
                ->build()
        );
        $taskDatabaseCreator->createDatabase($project, $this->task);
    }

    /**
     * @return array
     */
    public function providerLabeledThing()
    {
        return [
            [
                __DIR__ . '/../Resources/Exports/rectangle_meta.xml',
                [
                    [
                        'frameRange' => [
                            'startFrameIndex' => 21,
                            'endFrameIndex'   => 43,
                        ],
                        'classes'    => [],
                        'incomplete' => false,
                        'lineColor'  => 2,
                        'originalId' => 'fd4539b4-9b42-4415-b3f7-f7a15c31424b',
                    ],                    [
                        'frameRange' => [
                            'startFrameIndex' => 21,
                            'endFrameIndex'   => 43,
                        ],
                        'classes'    => [],
                        'incomplete' => false,
                        'lineColor'  => 10,
                        'originalId' => '11b2bf9f-a484-4b8c-a5ae-401920cc8600',
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array
     */
    public function providerLabeledThingInFrames()
    {
        return [
            [
                __DIR__ . '/../Resources/Exports/rectangle_meta.xml',
                [
                    [
                        'frameIndex'     => 21,
                        'classes'        => ['50'],
                        'ghostClasses'   => null,
                        'shape'          => [
                            'type'        => 'rectangle',
                            'topLeft'     => ['x' => 820, 'y' => 436],
                            'bottomRight' => ['x' => 968, 'y' => 583],
                        ],
                        'incomplete'     => false,
                        'identifierName' => 'time-range-sign',
                        'ghost'          => false,
                    ],
                    [
                        'frameIndex'     => 43,
                        'classes'        => ['10'],
                        'ghostClasses'   => null,
                        'shape'          => [
                            'type'        => 'rectangle',
                            'topLeft'     => ['x' => 120, 'y' => 136],
                            'bottomRight' => ['x' => 268, 'y' => 283],
                        ],
                        'incomplete'     => false,
                        'identifierName' => 'time-range-sign',
                        'ghost'          => false,
                    ],                    [
                        'frameIndex'     => 21,
                        'classes'        => ['20'],
                        'ghostClasses'   => null,
                        'shape'          => [
                            'type'        => 'rectangle',
                            'topLeft'     => ['x' => 120, 'y' => 136],
                            'bottomRight' => ['x' => 168, 'y' => 183],
                        ],
                        'incomplete'     => false,
                        'identifierName' => 'time-range-sign',
                        'ghost'          => false,
                    ],
                    [
                        'frameIndex'     => 43,
                        'classes'        => ['30'],
                        'ghostClasses'   => null,
                        'shape'          => [
                            'type'        => 'rectangle',
                            'topLeft'     => ['x' => 320, 'y' => 336],
                            'bottomRight' => ['x' => 368, 'y' => 383],
                        ],
                        'incomplete'     => false,
                        'identifierName' => 'time-range-sign',
                        'ghost'          => false,
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array
     */
    public function providerLabeledFrames()
    {
        return [
            [
                __DIR__ . '/../Resources/Exports/rectangle_meta.xml',
                [
                    [
                        'frameIndex'   => 21,
                        'classes'      => ['night', 'spain'],
                        'ghostClasses' => null,
                        'incomplete'   => true,
                    ],
                    [
                        'frameIndex'   => 637,
                        'classes'      => ['night', 'halogen', 'orange', 'germany'],
                        'ghostClasses' => null,
                        'incomplete'   => false,
                    ],
                ],
            ],
        ];
    }

    /**
     * @return array
     */
    public function providerLabeledThingGroups()
    {
        return [
            [
                __DIR__ . '/../Resources/Exports/rectangle_meta.xml',
                [
                    [
                        'groupType'  => 'extension-sign-group',
                        'lineColor'  => 6,
                        'originalId' => 'f516e810-2ddc-4f8f-8d9a-49c5b19f769c',
                    ],
                ],
            ],
        ];
    }

    /**
     * @dataProvider providerLabeledThing
     *
     * @param string $xmlFile
     * @param array  $expectedData
     */
    public function testImportLabeledThings($xmlFile, $expectedData)
    {
        $job = new Jobs\ThingImporter($xmlFile, $this->getTaskToFrameMapping());
        $this->thingImportJobInstruction->run($job, $this->logger);

        $projectId = $this->task->getProjectId();
        $taskId    = $this->task->getId();

        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $taskId
        );

        $labeledThings = $labeledThingFacade->findByTaskId($this->task);
        $this->assertCount(count($expectedData), $labeledThings);
        foreach ($labeledThings as $index => $labeledThing) {
            $expectedLabeledThingData = $expectedData[$index];

            $this->assertEquals(
                $expectedLabeledThingData['frameRange']['startFrameIndex'],
                $labeledThing->getFrameRange()->getStartFrameIndex()
            );
            $this->assertEquals(
                $expectedLabeledThingData['frameRange']['endFrameIndex'],
                $labeledThing->getFrameRange()->getEndFrameIndex()
            );
            $this->assertEquals($expectedLabeledThingData['classes'], $labeledThing->getClasses());
            $this->assertEquals($expectedLabeledThingData['incomplete'], $labeledThing->getIncomplete());
            $this->assertEquals($expectedLabeledThingData['lineColor'], $labeledThing->getLineColor());
            $this->assertEquals($expectedLabeledThingData['originalId'], $labeledThing->getOriginalId());
        }
    }

    /**
     * @dataProvider providerLabeledThingInFrames
     *
     * @param string $xmlFile
     * @param array  $expectedData
     */
    public function testImportLabeledThingsInFrame($xmlFile, $expectedData)
    {
        $job = new Jobs\ThingImporter($xmlFile, $this->getTaskToFrameMapping());
        $this->thingImportJobInstruction->run($job, $this->logger);

        $projectId = $this->task->getProjectId();
        $taskId    = $this->task->getId();

        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $taskId
        );

        $labeledThingInFrames = $labeledThingInFrameFacade->getLabeledThingsInFrame($this->task);
        $this->assertCount(count($expectedData), $labeledThingInFrames);
        foreach ($labeledThingInFrames as $index => $labeledThingInFrame) {
            $expectedLabeledThingInFrameData = $expectedData[$index];
            $shape                           = $labeledThingInFrame->getShapes()[0];

            $this->assertEquals($expectedLabeledThingInFrameData['frameIndex'], $labeledThingInFrame->getFrameIndex());
            $this->assertEquals($expectedLabeledThingInFrameData['classes'], $labeledThingInFrame->getClasses());
            $this->assertEquals(
                $expectedLabeledThingInFrameData['ghostClasses'],
                $labeledThingInFrame->getGhostClasses()
            );
            $this->assertEquals($expectedLabeledThingInFrameData['shape']['type'], $shape['type']);
            $this->assertEquals($expectedLabeledThingInFrameData['shape']['topLeft'], $shape['topLeft']);
            $this->assertEquals($expectedLabeledThingInFrameData['shape']['bottomRight'], $shape['bottomRight']);
            $this->assertEquals($expectedLabeledThingInFrameData['incomplete'], $labeledThingInFrame->getIncomplete());
            $this->assertEquals(
                $expectedLabeledThingInFrameData['identifierName'],
                $labeledThingInFrame->getIdentifierName()
            );
            $this->assertEquals($expectedLabeledThingInFrameData['ghost'], $labeledThingInFrame->isGhost());
        }
    }

    /**
     * @dataProvider providerLabeledFrames
     *
     * @param string $xmlFile
     * @param array  $expectedData
     */
    public function testImportLabeledFrame($xmlFile, $expectedData)
    {
        $job = new Jobs\ThingImporter($xmlFile, $this->getTaskToFrameMapping());
        $this->thingImportJobInstruction->run($job, $this->logger);

        $projectId = $this->task->getProjectId();
        $taskId    = $this->task->getId();

        $labeledFrameFacade = $this->labeledFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $taskId
        );

        $labeledFrames = $labeledFrameFacade->findBylabelingTask($this->task);
        $this->assertCount(count($expectedData), $labeledFrames);
        foreach ($labeledFrames as $index => $labeledFrame) {
            $expectedLabeledFrameData = $expectedData[$index];
            $this->assertEquals($expectedLabeledFrameData['frameIndex'], $labeledFrame->getFrameIndex());
            $this->assertEquals($expectedLabeledFrameData['classes'], $labeledFrame->getClasses());
            $this->assertEquals($expectedLabeledFrameData['ghostClasses'], $labeledFrame->getGhostClasses());
            $this->assertEquals($expectedLabeledFrameData['incomplete'], $labeledFrame->getIncomplete());
        }
    }

    /**
     * @dataProvider providerLabeledThingGroups
     *
     * @param string $xmlFile
     * @param array  $expectedData
     */
    public function testLabeledThingGroup($xmlFile, $expectedData)
    {
        $job = new Jobs\ThingImporter($xmlFile, $this->getTaskToFrameMapping());
        $this->thingImportJobInstruction->run($job, $this->logger);

        $projectId = $this->task->getProjectId();
        $taskId    = $this->task->getId();

        $labeledThingGroupFacadeFacade = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $taskId
        );

        $labeledThingGroupIds = $labeledThingGroupFacadeFacade->getLabeledThingGroupIdsByTask($this->task);
        $this->assertCount(count($expectedData), $labeledThingGroupIds);
        foreach ($labeledThingGroupIds as $index => $labeledThingGroupId) {
            $expectedLabeledFrameData = $expectedData[$index];
            $labeledThingGroup        = $labeledThingGroupFacadeFacade->find($labeledThingGroupId);
            $this->assertEquals($expectedLabeledFrameData['groupType'], $labeledThingGroup->getGroupType());
            $this->assertEquals($expectedLabeledFrameData['lineColor'], $labeledThingGroup->getLineColor());
            $this->assertEquals($expectedLabeledFrameData['originalId'], $labeledThingGroup->getOriginalId());
        }
    }

    /**
     * @return array
     */
    private function getTaskToFrameMapping()
    {
        $mapping = [];
        foreach (range(1, 660) as $frameNumber) {
            $mapping[$frameNumber] = $this->task->getId();
        }

        return $mapping;
    }
}