<?php

namespace AppBundle\Service\Exporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shape;
use AppBundle\Service;

class LegacyProjectToCsv implements Service\ProjectExporter
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\ProjectExport
     */
    private $projectExportFacade;

    /**
     * @var bool
     */
    private $headline;

    /**
     * @var string
     */
    private $delimiter;

    /**
     * @var string
     */
    private $enclosure;

    /**
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagationService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\VideoExport
     */
    private $videoExportFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThing;

    /**
     * @var Service\DepthBuffer
     */
    private $depthBufferService;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * Csv constructor.
     *
     * @param Service\GhostClassesPropagation $ghostClassesPropagationService
     * @param Facade\LabeledThingInFrame      $labeledThingInFrameFacade
     * @param Facade\LabeledThing             $labeledThing
     * @param Facade\ProjectExport            $projectExportFacade
     * @param Facade\Project                  $projectFacade
     * @param Facade\Video                    $videoFacade
     * @param Facade\VideoExport              $videoExportFacade
     * @param Service\DepthBuffer             $depthBufferService
     * @param Facade\CalibrationData          $calibrationDataFacade
     * @param bool                            $headline
     * @param string                          $delimiter
     * @param string                          $enclosure
     */
    public function __construct(
        Service\GhostClassesPropagation $ghostClassesPropagationService,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\LabeledThing $labeledThing,
        Facade\ProjectExport $projectExportFacade,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\VideoExport $videoExportFacade,
        Service\DepthBuffer $depthBufferService,
        Facade\CalibrationData $calibrationDataFacade,
        bool $headline = true,
        string $delimiter = ',',
        string $enclosure = '"'
    ) {
        $this->ghostClassesPropagationService = $ghostClassesPropagationService;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
        $this->projectExportFacade            = $projectExportFacade;
        $this->headline                       = $headline;
        $this->delimiter                      = $delimiter;
        $this->enclosure                      = $enclosure;
        $this->projectFacade                  = $projectFacade;
        $this->videoFacade                    = $videoFacade;
        $this->videoExportFacade              = $videoExportFacade;
        $this->labeledThing                   = $labeledThing;
        $this->depthBufferService             = $depthBufferService;
        $this->calibrationDataFacade          = $calibrationDataFacade;
    }

    /**
     * Export data for the given project.
     *
     * Only tasks with status done are considered.
     *
     * @param Model\Project $project
     *
     * @return Model\ProjectExport
     *
     * @throws Exception\LegacyProjectToCsv
     * @throws \Exception
     */
    public function exportProject(Model\Project $project)
    {
        try {
            // the generated zip file contains one csv file for each task group
            $taskGroups = [
                'pedestrian' => [
                    Model\LabelingTask::INSTRUCTION_PERSON,
                    Model\LabelingTask::INSTRUCTION_CYCLIST,
                    Model\LabelingTask::INSTRUCTION_IGNORE,
                ],
                'vehicle'    => [
                    Model\LabelingTask::INSTRUCTION_VEHICLE,
                    Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                    Model\LabelingTask::INSTRUCTION_PARKED_CARS,
                ],
                'lane'       => [
                    Model\LabelingTask::INSTRUCTION_LANE,
                ],
            ];

            $labelDataDispatcherMap = [
                Model\LabelingTask::INSTRUCTION_PERSON         => function (Model\LabelingTask $task) {
                    return $this->getPedestrianLabelingData($task);
                },
                Model\LabelingTask::INSTRUCTION_CYCLIST        => function (Model\LabelingTask $task) {
                    return $this->getCyclistLabelingData($task);
                },
                Model\LabelingTask::INSTRUCTION_IGNORE         => function (Model\LabelingTask $task) {
                    return $this->getIgnoreLabelingData($task);
                },
                Model\LabelingTask::INSTRUCTION_VEHICLE        => function (Model\LabelingTask $task) {
                    return $this->getVehicleLabelingData($task);
                },
                Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE => function (Model\LabelingTask $task) {
                    return $this->getVehicleIgnoreLabelingData($task);
                },
                Model\LabelingTask::INSTRUCTION_LANE           => function (Model\LabelingTask $task) {
                    return $this->getLaneLabelingData($task);
                },
                Model\LabelingTask::INSTRUCTION_PARKED_CARS    => function (Model\LabelingTask $task) {
                    return $this->getParkedCarsLabelingData($task);
                },
            ];

            $consideredTasks = [];
            $videoExportIds  = [];
            foreach ($taskGroups as $groupName => $groupInstructions) {
                $tasks = $this->getLabeledTasksForProject($project, $groupInstructions);

                $data = [];
                foreach ($tasks as $task) {
                    if (!isset($data[$task->getVideoId()])) {
                        $data[$task->getVideoId()] = [];
                    }

                    $data[$task->getVideoId()] = array_merge(
                        $data[$task->getVideoId()],
                        $labelDataDispatcherMap[$task->getLabelInstruction()]($task)
                    );
                }

                $consideredTasks = array_merge($tasks, $consideredTasks);

                foreach ($data as $videoId => $videoData) {
                    $videoExport = $this->createVideoExport(
                        $project,
                        $videoData,
                        $videoId,
                        $groupName,
                        $consideredTasks
                    );

                    if ($videoExport !== null) {
                        $videoExportIds[] = $videoExport->getId();
                    }
                }
            }

            $date          = new \DateTime('now', new \DateTimeZone('UTC'));
            $projectExport = new Model\ProjectExport(
                $project,
                $videoExportIds,
                sprintf('csv_%s.zip', $date->format('Ymd_His'))
            );

            $this->projectExportFacade->save($projectExport);

            return $projectExport;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return mixed
     */
    public function getIgnoreLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) use ($frameNumberMapping, $labelInstruction) {
                $ignoreType = $this->getClassByRegex('/^(person|cyclist)$/', 1, $labeledThingInFrame);

                return [
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $labelInstruction . '-' . $ignoreType,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'    => 0,
                    'truncation'   => 0,
                    'direction'    => 'none',
                    'id'           => null,
                    'uuid'         => $labeledThingInFrame->getLabeledThingId(),
                ];
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return array
     */
    public function getCyclistLabelingData(Model\LabelingTask $task)
    {
        return $this->getPedestrianLabelingData($task);
    }

    /**
     * Get the pedestrian labeling data
     *
     * @param Model\LabelingTask $task
     *
     * @return array
     */
    public function getPedestrianLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) use ($frameNumberMapping, $labelInstruction) {
                $direction  = $this->getClassByRegex('/^(direction-(\w+|(\w+-\w+)))$/', 2, $labeledThingInFrame);
                $occlusion  = $this->getOcclusion($labeledThingInFrame);
                $truncation = $this->getTruncation($labeledThingInFrame);

                return [
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $labelInstruction,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'    => $occlusion,
                    'truncation'   => $truncation,
                    'direction'    => $direction,
                    'id'           => null,
                    'uuid'         => $labeledThingInFrame->getLabeledThingId(),
                ];
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return array
     */
    public function getVehicleLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();

        return array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) use ($frameNumberMapping, $task) {
                $vehicleType = $this->getClassByRegex(
                    '/^(car|truck|van|2-wheeler-vehicle|bus|misc-vehicle)$/',
                    0,
                    $labeledThingInFrame
                );
                if ($this->hasOcclusion($labeledThingInFrame)) {
                    $occlusion          = $this->getOcclusion($labeledThingInFrame);
                    $occlusionFrontBack = '';
                    $occlusionSide      = '';
                } else {
                    $occlusion          = '';
                    $occlusionFrontBack = $this->getOcclusion($labeledThingInFrame, 'front-back');
                    $occlusionSide      = $this->getOcclusion($labeledThingInFrame, 'side');
                }

                $truncation = $this->getTruncation($labeledThingInFrame);

                $result = [
                    'frame_number'         => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'vehicleType'          => $vehicleType,
                    'position_x'           => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'           => $this->getPosition($labeledThingInFrame)['y'],
                    'width'                => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'               => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'            => $occlusion,
                    'occlusion_front-back' => $occlusionFrontBack,
                    'occlusion_side'       => $occlusionSide,
                    'truncation'           => $truncation,
                    'direction'            => '3d data',
                    'id'                   => null,
                    'uuid'                 => $labeledThingInFrame->getLabeledThingId(),
                ];

                if ($task->getDrawingTool() === Model\LabelingTask::DRAWING_TOOL_CUBOID) {
                    $video      = $this->videoFacade->find($task->getVideoId());
                    $vertices2d = $this->getCuboidVertices($labeledThingInFrame, $video)[0];

                    $floatValue = function ($value) {
                        return $value === null ? 'null' : round($value, 4);
                    };

                    foreach (range(0, 7) as $vertexPoint) {
                        $result['vertex_2d_' . $vertexPoint . '_x'] = $floatValue($vertices2d[$vertexPoint][0]);
                        $result['vertex_2d_' . $vertexPoint . '_y'] = $floatValue($vertices2d[$vertexPoint][1]);
                    }

                    $vertices3d = $labeledThingInFrame->getShapes()[0]['vehicleCoordinates'];
                    foreach (range(0, 7) as $vertexPoint) {
                        $result['vertex_3d_' . $vertexPoint . '_x'] = $floatValue($vertices3d[$vertexPoint][0]);
                        $result['vertex_3d_' . $vertexPoint . '_y'] = $floatValue($vertices3d[$vertexPoint][1]);
                        $result['vertex_3d_' . $vertexPoint . '_z'] = $floatValue($vertices3d[$vertexPoint][2]);
                    }
                }

                return $result;
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return mixed
     */
    public function getVehicleIgnoreLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) use ($frameNumberMapping, $labelInstruction) {
                $ignoreType = $this->getClassByRegex('/^(ignore-vehicle)$/', 1, $labeledThingInFrame);
                $result     = [
                    'frame_number'         => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'          => $ignoreType,
                    'position_x'           => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'           => $this->getPosition($labeledThingInFrame)['y'],
                    'width'                => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'               => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'            => 'none',
                    'occlusion-front-back' => 'none',
                    'occlusion-side'       => 'none',
                    'truncation'           => 'none',
                    'direction'            => 'none',
                    'id'                   => null,
                    'uuid'                 => $labeledThingInFrame->getLabeledThingId(),
                ];
                foreach (range(0, 7) as $vertexPoint) {
                    $result['vertex_2d_' . $vertexPoint . '_x'] = 'null';
                    $result['vertex_2d_' . $vertexPoint . '_y'] = 'null';
                }
                foreach (range(0, 7) as $vertexPoint) {
                    $result['vertex_3d_' . $vertexPoint . '_x'] = 'null';
                    $result['vertex_3d_' . $vertexPoint . '_y'] = 'null';
                    $result['vertex_3d_' . $vertexPoint . '_z'] = 'null';
                }

                return $result;
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return mixed
     */
    public function getLaneLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) use ($frameNumberMapping, $labelInstruction) {
                return [
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $labelInstruction,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'    => 0,
                    'truncation'   => 0,
                    'direction'    => 'none',
                    'id'           => null,
                    'uuid'         => $labeledThingInFrame->getLabeledThingId(),
                ];
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return mixed
     */
    public function getParkedCarsLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function (Model\LabeledThingInFrame $labeledThingInFrame) use (
                $frameNumberMapping,
                $labelInstruction,
                $task
            ) {
                $result = [
                    'frame_number'         => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'          => $labelInstruction,
                    'position_x'           => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'           => $this->getPosition($labeledThingInFrame)['y'],
                    'width'                => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'               => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'            => 'none',
                    'occlusion-front-back' => 'none',
                    'occlusion-side'       => 'none',
                    'truncation'           => 'none',
                    'direction'            => '3d data',
                    'id'                   => null,
                    'uuid'                 => $labeledThingInFrame->getLabeledThingId(),
                ];

                if ($task->getDrawingTool() === Model\LabelingTask::DRAWING_TOOL_CUBOID) {
                    $floatValue = function ($value) {
                        return $value === null ? 'null' : round($value, 4);
                    };

                    $video      = $this->videoFacade->find($task->getVideoId());
                    $vertices2d = $this->getCuboidVertices($labeledThingInFrame, $video)[0];
                    foreach (range(0, 7) as $vertexPoint) {
                        $result['vertex_2d_' . $vertexPoint . '_x'] = $floatValue($vertices2d[$vertexPoint][0]);
                        $result['vertex_2d_' . $vertexPoint . '_y'] = $floatValue($vertices2d[$vertexPoint][1]);
                    }

                    $vertices3d = $labeledThingInFrame->getShapes()[0]['vehicleCoordinates'];
                    foreach (range(0, 7) as $vertexPoint) {
                        $result['vertex_3d_' . $vertexPoint . '_x'] = $floatValue($vertices3d[$vertexPoint][0]);
                        $result['vertex_3d_' . $vertexPoint . '_y'] = $floatValue($vertices3d[$vertexPoint][1]);
                        $result['vertex_3d_' . $vertexPoint . '_z'] = $floatValue($vertices3d[$vertexPoint][2]);
                    }
                }

                return $result;
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param string|null?                    $type
     *
     * @return int|string
     */
    private function getOcclusion(Model\LabeledThingInFrame $labeledThingInFrame, $type = null)
    {
        $occlusionClassPrefix = $type === null ? 'occlusion' : $type . '-occlusion';
        $occlusionClass       = $this->getClassByRegex(
            '/^(' . $occlusionClassPrefix . '-(\d{1,2}|(\d{1,2}-\d{1,2})))$/',
            2,
            $labeledThingInFrame
        );

        switch ($occlusionClass) {
            case '0':
                return 0;
            case '25':
                return 1;
            case '25-50':
                return 2;
            case '50':
                return 3;
            default:
                return 'unknown';
        }
    }

    /**
     * Determine if the given LabeledThingInFrame has a specific occlusion-type set.
     *
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @param string|null? $type
     *
     * @return bool
     */
    private function hasOcclusion(Model\LabeledThingInFrame $labeledThingInFrame, $type = null)
    {
        $occlusionClassPrefix = $type === null ? 'occlusion-' : $type . '-occlusion-';
        $classesToSearch      = $labeledThingInFrame->getClassesWithGhostClasses();
        foreach ($classesToSearch as $possibleOcclusion) {
            if (strpos($possibleOcclusion, $occlusionClassPrefix) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return int|string
     */
    private function getTruncation(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        switch ($this->getClassByRegex('/^(truncation-(\d{1,2}|\d{1,2}-\d{1,2}))$/', 2, $labeledThingInFrame)) {
            case '0':
                return 0;
            case '25':
                return 1;
            case '25-50':
                return 2;
            case '50':
                return 3;
            default:
                return 'unknown';
        }
    }

    /**
     * @param string                    $regex
     * @param string|int                $groupName
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return string
     */
    private function getClassByRegex($regex, $groupName, Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $builder = new Service\Exporter\Extractor\RegexBuilder();
        $builder->setRegexPattern($regex);
        $builder->setGroupName($groupName);
        $regexExtractor = $builder->getRegexExtractor();

        return $regexExtractor->extract($labeledThingInFrame);
    }

    private function getCuboidVertices(Model\LabeledThingInFrame $labeledThingInFrame, Model\Video $video)
    {
        $shapes = $labeledThingInFrame->getShapes();
        $shape  = Shape::createFromArray($shapes[0]);

        if ($shape->getType() !== 'cuboid3d') {
            throw new \Exception('Unsupported type ' . $shape->getType());
        }

        return $this->depthBufferService->getVertices(
            $shape,
            $this->calibrationDataFacade->findById($video->getCalibrationId())->getCalibration()
        );
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return array
     */
    private function getPosition(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $shapes = $labeledThingInFrame->getShapes();
        if (count($shapes) === 0) {
            return [
                'x' => 'null',
                'y' => 'null',
            ];
        }

        $shape = Shape::createFromArray($shapes[0]);

        switch ($shape->getType()) {
            case 'rectangle':
                return [
                    'x' => (int) round($shape->getLeft()),
                    'y' => (int) round($shape->getTop()),
                ];
                break;
            case 'pedestrian':
                $heightHalf = ($shape->getBottomCenterY() - $shape->getTopCenterY()) / 2;
                $widthHalf  = $heightHalf * 0.41;

                return [
                    'x' => (int) ($shape->getTopCenterX() - $widthHalf),
                    'y' => (int) $shape->getTopCenterY(),
                ];
                break;
            default:
                return [
                    'x' => 'null',
                    'y' => 'null',
                ];
        }
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return array
     */
    private function getDimensions(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $shapes = $labeledThingInFrame->getShapes();
        if (count($shapes) === 0) {
            return [
                'width'  => 'null',
                'height' => 'null',
            ];
        }

        $shape = Shape::createFromArray($shapes[0]);

        switch ($shape->getType()) {
            case 'rectangle':
                return [
                    'width'  => (int) round($shape->getWidth()),
                    'height' => (int) round($shape->getHeight()),
                ];
                break;
            case 'pedestrian':
                $heightHalf = ($shape->getBottomCenterY() - $shape->getTopCenterY()) / 2;
                $widthHalf  = $heightHalf * 0.41;

                return [
                    'width'  => (int) round($widthHalf * 2),
                    'height' => (int) round(($shape->getBottomCenterY() - $shape->getTopCenterY())),
                ];
                break;
            default:
                return [
                    'width'  => 'null',
                    'height' => 'null',
                ];
        }
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return Model\LabeledThingInFrame[]
     */
    private function loadLabeledThingsInFrame(Model\LabelingTask $task)
    {
        $labeledThingsInFrames                 = $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task);
        $labeledThingsInFramesWithGhostClasses = $this->ghostClassesPropagationService->propagateGhostClasses(
            $labeledThingsInFrames
        );

        return $labeledThingsInFramesWithGhostClasses;
    }

    /**
     * @param Model\Project $project
     * @param array         $requiredTasksInstructions
     *
     * @return Model\LabelingTask[]
     *
     * @throws \Exception
     */
    public function getLabeledTasksForProject(Model\Project $project, array $requiredTasksInstructions)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);

        $taskInstructions = array_map(
            function (Model\LabelingTask $task) {
                return $task->getLabelInstruction();
            },
            $tasks
        );

        if (count(array_intersect($taskInstructions, $requiredTasksInstructions)) === 0) {
            return [];
        }

        $labeledTasks = array_filter(
            $tasks,
            function (Model\LabelingTask $task) use ($requiredTasksInstructions) {
                if (in_array($task->getLabelInstruction(), $requiredTasksInstructions)) {
                    return $task->getStatus(Model\LabelingTask::PHASE_LABELING) === Model\LabelingTask::STATUS_DONE;
                }

                return false;
            }
        );

        $labeledTaskInstructions = array_map(
            function (Model\LabelingTask $task) {
                return $task->getLabelInstruction();
            },
            $labeledTasks
        );

        // If the required types are missing, return no tasks
        if (count(array_unique(array_intersect($labeledTaskInstructions, $requiredTasksInstructions)))
            !== count($requiredTasksInstructions)
        ) {
            return [];
        }

        foreach ($labeledTasks as $labeledTask) {
            if (count($this->labeledThingInFrameFacade->getIncompleteLabeledThingsInFrame($labeledTask)) > 0) {
                throw new \Exception('Task not completed');
            }
        }

        return $labeledTasks;
    }

    /**
     * Creates the VideoExport document and returns it.
     *
     * If no video export could be created, e.g. if there is no data, `null` is returned.
     *
     * @param Model\Project        $project
     * @param array                $videoData
     * @param string               $videoId
     * @param string               $groupName
     * @param Model\LabelingTask[] $consideredTasks
     *
     * @return Model\VideoExport|null
     *
     * @throws Exception\LegacyProjectToCsv
     */
    private function createVideoExport(
        Model\Project $project,
        array $videoData,
        string $videoId,
        string $groupName,
        array $consideredTasks
    ) {
        if (empty($videoData)) {
            return null;
        }

        uasort(
            $videoData,
            function ($a, $b) {
                return $a['frame_number'] <=> $b['frame_number'];
            }
        );

        $shortUuidNumbers = array_flip(array_unique(array_column($videoData, 'uuid')));

        $videoData = array_map(
            function ($label) use ($shortUuidNumbers) {
                $label['id'] = $shortUuidNumbers[$label['uuid']];

                return $label;
            },
            $videoData
        );

        $tempCsvFile = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        $fp = fopen($tempCsvFile, 'w');
        if ($this->headline) {
            fputcsv($fp, array_keys($videoData[0]), $this->delimiter, $this->enclosure);
        }

        foreach ($videoData as $labeledThingInFrame) {
            fputcsv($fp, $labeledThingInFrame, $this->delimiter, $this->enclosure);
        }
        fclose($fp);

        $video    = $this->videoFacade->find($videoId);
        $filename = sprintf(
            'export_%s_%s_%s.csv',
            str_replace(' ', '_', $project->getName()),
            $groupName,
            str_replace(' ', '_', $video->getName())
        );

        $videoExport = $this->videoExportFacade->save(
            new Model\VideoExport(
                $video,
                $consideredTasks,
                $filename,
                'text/csv',
                file_get_contents($tempCsvFile)
            )
        );

        if (!unlink($tempCsvFile)) {
            throw new Exception\LegacyProjectToCsv(
                sprintf('Unable to remove temporary csv file at "%s"', $tempCsvFile)
            );
        }

        return $videoExport;
    }
}
