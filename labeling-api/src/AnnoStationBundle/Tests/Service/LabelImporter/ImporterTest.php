<?php

namespace AnnoStationBundle\Tests\Service\LabelImporter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shapes;
use AnnoStationBundle\Service\LabelImporter\Importer;
use AnnoStationBundle\Service\LabelImporter\Parser;
use AnnoStationBundle\Service\LabelImporter\DataSource;
use AppBundle\Tests;
use AnnoStationBundle\Tests\Helper;

class LabelImporterTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

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
     * @var Importer\SimpleXml2d
     */
    private $importer2d;

    /**
     * @var Importer\SimpleXml3d
     */
    private $importer3d;

    public function provider()
    {
        return [
            [
                [
                    'drawingTool'           => Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
                    'taskConfigurationFile' => __DIR__ . '/../../Resources/TaskConfigurations/Simple/Rectangle.xml',
                    'exportFile'            => __DIR__ . '/Exports/Rectangle.csv',
                ],
                [
                    [
                        'frameIndex' => 21,
                        'classes'    => ['occlusion-0', 'truncation-0', 'direction-right'],
                        'shapes'     => [
                            [
                                'type'        => 'rectangle',
                                'topLeft'     => ['x' => 377.0, 'y' => 320.0],
                                'bottomRight' => ['x' => 547.0, 'y' => 395.0],
                            ],
                        ],
                    ],
                    [
                        'frameIndex' => 21,
                        'classes'    => ['occlusion-3', 'truncation-3', 'direction-front-left'],
                        'shapes'     => [
                            [
                                'type'        => 'rectangle',
                                'topLeft'     => ['x' => 619.0, 'y' => 326.0],
                                'bottomRight' => ['x' => 732.0, 'y' => 392.0],
                            ],
                        ],
                    ],
                    [
                        'frameIndex' => 43,
                        'classes'    => ['occlusion-3', 'truncation-3', 'direction-front-left'],
                        'shapes'     => [
                            [
                                'type'        => 'rectangle',
                                'topLeft'     => ['x' => 642.0, 'y' => 334.0],
                                'bottomRight' => ['x' => 708.0, 'y' => 389.0],
                            ],
                        ],
                    ],
                    [
                        'frameIndex' => 43,
                        'classes'    => ['occlusion-0', 'truncation-0', 'direction-right'],
                        'shapes'     => [
                            [
                                'type'        => 'rectangle',
                                'topLeft'     => ['x' => 502.0, 'y' => 328.0],
                                'bottomRight' => ['x' => 672.0, 'y' => 403.0],
                            ],
                        ],
                    ],
                    [
                        'frameIndex' => 65,
                        'classes'    => ['occlusion-0', 'truncation-0', 'direction-right'],
                        'shapes'     => [
                            [
                                'type'        => 'rectangle',
                                'topLeft'     => ['x' => 591.0, 'y' => 333.0],
                                'bottomRight' => ['x' => 726.0, 'y' => 397.0],
                            ],
                        ],
                    ],
                    [
                        'frameIndex' => 87,
                        'classes'    => ['occlusion-0', 'truncation-0', 'direction-right'],
                        'shapes'     => [
                            [
                                'type'        => 'rectangle',
                                'topLeft'     => ['x' => 632.0, 'y' => 333.0],
                                'bottomRight' => ['x' => 709.0, 'y' => 394.0],
                            ],
                        ],
                    ],
                ],
            ],
            [
                [
                    'drawingTool'           => Model\LabelingTask::DRAWING_TOOL_PEDESTRIAN,
                    'taskConfigurationFile' => __DIR__ . '/../../Resources/TaskConfigurations/Simple/Pedestrian.xml',
                    'exportFile'            => __DIR__ . '/Exports/Pedestrian.csv',
                ],
                [
                    [
                        'frameIndex' => 21,
                        'classes'    => ['occlusion-1', 'truncation-2', 'direction-right'],
                        'shapes'     => [
                            [
                                'type'         => 'pedestrian',
                                'topCenter'    => ['x' => 404.5, 'y' => 323.0],
                                'bottomCenter' => ['x' => 404.5, 'y' => 399.0],
                            ],
                        ],
                    ],
                    [
                        'frameIndex' => 43,
                        'classes'    => ['occlusion-3', 'truncation-1', 'direction-left'],
                        'shapes'     => [
                            [
                                'type'         => 'pedestrian',
                                'topCenter'    => ['x' => 521.5, 'y' => 323.0],
                                'bottomCenter' => ['x' => 521.5, 'y' => 399.0],
                            ],
                        ],
                    ],
                ],
            ],
            [
                [
                    'drawingTool'           => Model\LabelingTask::DRAWING_TOOL_CUBOID,
                    'taskConfigurationFile' => __DIR__ . '/../../Resources/TaskConfigurations/Simple/Cuboid.xml',
                    'exportFile'            => __DIR__ . '/Exports/Cuboid.csv',
                ],
                [
                    [
                        'frameIndex' => 21,
                        'classes'    => ['occlusion-0', 'truncation-0', 'direction-back-right'],
                        'shapes'     => [
                            [
                                'type'               => 'cuboid3d',
                                'vehicleCoordinates' => [
                                    [
                                        5.5750999999999999,
                                        2.7147999999999999,
                                        1.0,
                                    ],
                                    [
                                        5.5750999999999999,
                                        0.71479999999999999,
                                        1.0,
                                    ],
                                    [
                                        5.5750999999999999,
                                        0.71479999999999999,
                                        0.0,
                                    ],
                                    [
                                        5.5750999999999999,
                                        2.7147999999999999,
                                        0.0,
                                    ],
                                    [
                                        6.5750999999999999,
                                        2.7147999999999999,
                                        1.0,
                                    ],
                                    [
                                        6.5750999999999999,
                                        0.71479999999999999,
                                        1.0,
                                    ],
                                    [
                                        6.5750999999999999,
                                        0.71479999999999999,
                                        0.0,
                                    ],
                                    [
                                        6.5750999999999999,
                                        2.7147999999999999,
                                        0.0,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    [
                        'frameIndex' => 43,
                        'classes'    => ['occlusion-0', 'truncation-0', 'direction-back-right'],
                        'shapes'     => [
                            [
                                'type'               => 'cuboid3d',
                                'vehicleCoordinates' => [
                                    [
                                        6.5309999999999997,
                                        1.0224,
                                        1.6312,
                                    ],
                                    [
                                        6.5309999999999997,
                                        -0.97760000000000002,
                                        1.6312,
                                    ],
                                    [
                                        6.5309999999999997,
                                        -0.97760000000000002,
                                        0.0,
                                    ],
                                    [
                                        6.5309999999999997,
                                        1.0224,
                                        0.0,
                                    ],
                                    null,
                                    null,
                                    null,
                                    null,
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * @dataProvider provider
     *
     * @param $configuration
     * @param $expected
     */
    public function testRectanglesImport($configuration, $expected)
    {
        $xml = file_get_contents($configuration['taskConfigurationFile']);

        $organisation = Helper\OrganisationBuilder::create()->build();
        $taskConfiguration = $this->taskConfigurationFacade->save(
            Helper\TaskConfigurationRequirementsBuilder::create($organisation, $xml, $this->defaultUser)->build()
        );

        $project      = $this->projectFacade->save(Helper\ProjectBuilder::create($organisation)->build());
        $video        = $this->videoFacade->save(Helper\VideoBuilder::create($organisation)->build());
        $task         = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)
                ->withTaskConfiguration($taskConfiguration)
                ->withDrawingTool($configuration['drawingTool'])
                ->build()
        );

        $parser = new Parser\Csv(
            new DataSource\File(
                new \SplFileObject(
                    $configuration['exportFile']
                )
            )
        );
        $parser->setFirstLineIsHeader(true);

        switch ($configuration['drawingTool']) {
            case Model\LabelingTask::DRAWING_TOOL_RECTANGLE:
            case Model\LabelingTask::DRAWING_TOOL_PEDESTRIAN:
                $this->importer2d->import($parser, $task);
                break;
            case Model\LabelingTask::DRAWING_TOOL_CUBOID:
                $this->importer3d->import($parser, $task);
                break;
        }

        $labeledThingsInFrames = array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) {
                return [
                    'frameIndex' => $labeledThingInFrame->getFrameIndex(),
                    'classes'    => $labeledThingInFrame->getClasses(),
                    'shapes'     => array_map(
                        function ($shape) {
                            unset($shape['id']);

                            return $shape;
                        },
                        $labeledThingInFrame->getShapes()
                    ),
                ];
            },
            $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task)
        );

        $this->assertEquals($expected, $labeledThingsInFrames);
    }

    public function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->taskConfigurationFacade   = $this->getAnnostationService('database.facade.task_configuration');
        $this->importer2d                = $this->getAnnostationService('service.label_importer.simple_xml_2d');
        $this->importer3d                = $this->getAnnostationService('service.label_importer.simple_xml_3d');
    }
}
