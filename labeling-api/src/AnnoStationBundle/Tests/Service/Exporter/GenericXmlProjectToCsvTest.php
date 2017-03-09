<?php

namespace AnnoStationBundle\Tests\Helper\Export;

use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Tests;
use AppBundle\Model;

class GenericXmlProjectToCsvTest extends Tests\CouchDbTestCase
{
    /**
     * @var Service\Exporter\GenericXmlProjectToCsv
     */
    private $genericXmlProjectToCsvService;

    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    public function dataProviderForObjectLabeling()
    {
        return [
            [
                [
                    'taskConfiguration'    => 'Rectangle.xml',
                    'drawingTool'          => Model\LabelingTask::DRAWING_TOOL_RECTANGLE,
                    'labeledThingInFrames' => [
                        [
                            'uuid'       => 'c5c0ec245bf7c953c721fbba6025085a',
                            'frameIndex' => 22,
                            'shapes'     => [
                                [
                                    'type'        => 'rectangle',
                                    'topLeft'     => [
                                        'x' => 148,
                                        'y' => 144,
                                    ],
                                    'bottomRight' => [
                                        'x' => 382,
                                        'y' => 335,
                                    ],
                                ],
                            ],
                            'classes'    => [
                                'occlusion-0',
                                'truncation-0',
                                'direction-back',
                            ],
                        ],
                        [
                            'uuid'       => '0735702d52300b44aea6a35ad00573f0',
                            'frameIndex' => 44,
                            'shapes'     => [
                                [
                                    'type'        => 'rectangle',
                                    'topLeft'     => [
                                        'x' => 148,
                                        'y' => 144,
                                    ],
                                    'bottomRight' => [
                                        'x' => 382,
                                        'y' => 335,
                                    ],
                                ],
                            ],
                            'classes'    => [
                                'occlusion-0',
                                'truncation-0',
                                'direction-back',
                            ],
                        ],
                    ],
                ],
                file_get_contents(__DIR__ . '/Expected/Rectangle.csv'),
            ],[
                [
                    'taskConfiguration'    => 'Polygon.xml',
                    'drawingTool'          => Model\LabelingTask::DRAWING_TOOL_POLYGON,
                    'labeledThingInFrames' => [
                        [
                            'uuid'       => 'c5c0ec245bf7c953c721fbba6025085a',
                            'frameIndex' => 22,
                            'shapes'     => [
                                [
                                    'type'   => 'polygon',
                                    'points' => [
                                        [
                                            'x' => 148,
                                            'y' => 144,
                                        ],
                                        [
                                            'x' => 248,
                                            'y' => 244,
                                        ],
                                        [
                                            'x' => 348,
                                            'y' => 344,
                                        ],
                                    ],
                                ],
                            ],
                            'classes'    => [
                                'occlusion-0',
                                'truncation-0',
                                'direction-back',
                            ],
                        ],
                        [
                            'uuid'       => '0735702d52300b44aea6a35ad00573f0',
                            'frameIndex' => 44,
                            'shapes'     => [
                                [
                                    'type'   => 'polygon',
                                    'points' => [
                                        [
                                            'x' => 448,
                                            'y' => 444,
                                        ],
                                        [
                                            'x' => 548,
                                            'y' => 544,
                                        ],
                                        [
                                            'x' => 648,
                                            'y' => 644,
                                        ],
                                    ],
                                ],
                            ],
                            'classes'    => [
                                'occlusion-0',
                                'truncation-0',
                                'direction-back',
                            ],
                        ],
                    ],
                ],
                file_get_contents(__DIR__ . '/Expected/Polygon.csv'),
            ], [
                [
                    'taskConfiguration'    => 'Cuboid.xml',
                    'drawingTool'          => Model\LabelingTask::DRAWING_TOOL_CUBOID,
                    'labeledThingInFrames' => [
                        [
                            'uuid'       => 'c5c0ec245bf7c953c721fbba6025085a',
                            'frameIndex' => 22,
                            'shapes'     => [
                                [
                                    'type'               => 'cuboid3d',
                                    'id'=> '522498cf-6dac-4816-8d5c-12094efb4923',
                                    'vehicleCoordinates' => [
                                        [
                                            5.2135144957764,
                                            2.2956556658422,
                                            1,
                                        ],
                                        [
                                            5.2135144957764,
                                            0.29565566584221,
                                            1,
                                        ],
                                        [
                                            5.2135144957764,
                                            0.29565566584221,
                                            0,
                                        ],
                                        [
                                            5.2135144957764,
                                            2.2956556658422,
                                            0,
                                        ],
                                        [
                                            6.2135144957764,
                                            2.2956556658422,
                                            1,
                                        ],
                                        [
                                            6.2135144957764,
                                            0.29565566584221,
                                            1,
                                        ],
                                        [
                                            6.2135144957764,
                                            0.29565566584221,
                                            0,
                                        ],
                                        [
                                            6.2135144957764,
                                            2.2956556658422,
                                            0,
                                        ],
                                    ],
                                ],
                            ],
                            'classes'    => [
                                'occlusion-0',
                                'truncation-0',
                                'direction-back',
                            ],
                        ],
                        [
                            'uuid'       => '0735702d52300b44aea6a35ad00573f0',
                            'frameIndex' => 44,
                            'shapes'     => [
                                [
                                    'type'               => 'cuboid3d',
                                    'id'=> '522498cf-6dac-4816-8d5c-12094efb4922',
                                    'vehicleCoordinates' => [
                                        [
                                            5.2135144957764,
                                            2.2956556658422,
                                            1,
                                        ],
                                        [
                                            5.2135144957764,
                                            0.29565566584221,
                                            1,
                                        ],
                                        [
                                            5.2135144957764,
                                            0.29565566584221,
                                            0,
                                        ],
                                        [
                                            5.2135144957764,
                                            2.2956556658422,
                                            0,
                                        ],
                                        [
                                            6.2135144957764,
                                            2.2956556658422,
                                            1,
                                        ],
                                        [
                                            6.2135144957764,
                                            0.29565566584221,
                                            1,
                                        ],
                                        [
                                            6.2135144957764,
                                            0.29565566584221,
                                            0,
                                        ],
                                        [
                                            6.2135144957764,
                                            2.2956556658422,
                                            0,
                                        ],
                                    ],
                                ],
                            ],
                            'classes'    => [
                                'occlusion-0',
                                'truncation-0',
                                'direction-back',
                            ],
                        ],
                    ],
                ],
                file_get_contents(__DIR__ . '/Expected/Cuboid.csv'),
            ],
        ];
    }

    public function setUpImplementation()
    {
        parent::setUpImplementation();

        $this->exporterFacade = $this->getAnnostationService('database.facade.exporter');

        $this->genericXmlProjectToCsvService = $this->getAnnostationService(
            'service.exporter.generic_xml_project_to_csv'
        );
    }

    /**
     * @dataProvider dataProviderForObjectLabeling
     *
     * @param $data
     * @param $expectedData
     */
    public function testObjectLabelingExport($data, $expectedData)
    {
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

        $organisation = $this->createOrganisation();

        $xmlTaskConfiguration = file_get_contents(__DIR__ . '/TaskConfiguration/' . $data['taskConfiguration']);
        $project              = $this->createProject('project-id-1', $this->createOrganisation());
        $video                = $this->createVideo(
            $organisation,
            'video-id-1',
            $this->createCalibrationData('CalibrationSample', $calibration)
        );
        $task = $this->createTask(
            $project,
            $video,
            $this->createTaskConfiguration(
                $xmlTaskConfiguration,
                $organisation,
                $this->createClientUser()
            ),
            $data['drawingTool']
        );
        $labeledThing         = $this->createLabeledThing($task, '0735702d52300b44aea6a35ad00564c4');
        foreach ($data['labeledThingInFrames'] as $labeledThingInFrame) {
            $this->createLabeledThingInFrame(
                $labeledThing,
                $labeledThingInFrame['frameIndex'],
                $labeledThingInFrame['shapes'],
                $labeledThingInFrame['classes'],
                $labeledThingInFrame['uuid']
            );
        }

        $export = $this->exporterFacade->save(new Model\Export($project));

        $this->genericXmlProjectToCsvService->export($export);

        $attachments = $export->getAttachments();

        $content = $this->getContentFromZip(reset($attachments)->getRawData(), 'video-id-1.csv');

        $this->assertEquals($expectedData, $content);
    }

    public function testMetadataExport()
    {
        $xmlTaskConfiguration = file_get_contents(__DIR__ . '/TaskConfiguration/MetaLabeling.xml');
        $project              = $this->createProject('project-id-1', $this->createOrganisation());
        $video                = $this->createVideo($this->createOrganisation(), 'video-id-1');
        $task = $this->createTask(
            $project,
            $video,
            $this->createTaskConfiguration(
                $xmlTaskConfiguration,
                $this->createOrganisation(),
                $this->createClientUser()
            ),
            null,
            Model\LabelingTask::TYPE_META_LABELING
        );

        $this->createLabeledFrame(
            $task,
            22,
            '0735702d52300b44aea6a35ad00573f0',
            ['occlusion-3', 'truncation-3', 'direction-front-right']
        );
        $this->createLabeledFrame(
            $task,
            44,
            '0735702d52300b44aea6a35ad00573f1',
            ['occlusion-3', 'truncation-3', 'direction-front-right']
        );

        $export = $this->exporterFacade->save(new Model\Export($project));

        $this->genericXmlProjectToCsvService->export($export);

        $attachments = $export->getAttachments();

        $content = $this->getContentFromZip(reset($attachments)->getRawData(), 'video-id-1_meta.csv');

        $this->assertEquals(file_get_contents(__DIR__ . '/Expected/MetaLabeling.csv'), $content);
    }

    private function getContentFromZip($data, $filename)
    {
        $tempZipFile = \tempnam(sys_get_temp_dir(), 'test_generic_export_zip');
        file_put_contents($tempZipFile, $data);
        $zip = new \ZipArchive;
        $zip->open($tempZipFile);
        $zip->extractTo(sys_get_temp_dir(), [$filename]);
        $zip->close();

        $content = file_get_contents(sys_get_temp_dir() . '/' . $filename);
        unlink(sys_get_temp_dir() . '/' . $filename);

        return $content;
    }
}
