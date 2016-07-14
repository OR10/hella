<?php

namespace AppBundle\Service\ProjectExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shape;
use AppBundle\Model\ProjectExporter;
use AppBundle\Service;
use AppBundle\Service\ProjectExporter\Exception;

class Csv implements Service\ProjectExporter
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\TaskExport
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
     * Csv constructor.
     *
     * @param Service\GhostClassesPropagation $ghostClassesPropagationService
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\LabeledThing $labeledThing
     * @param Facade\ProjectExport $projectExportFacade
     * @param Facade\Project $projectFacade
     * @param Facade\Video $videoFacade
     * @param Facade\VideoExport $videoExportFacade
     * @param Service\DepthBuffer $depthBufferService
     * @param bool $headline
     * @param string $delimiter
     * @param string $enclosure
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
        $headline = true,
        $delimiter = ',',
        $enclosure = '"'
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
    }

    /**
     * Export data for the given task.
     *
     * @param Model\Project $project
     * @return mixed
     * @throws Exception\Csv
     * @throws \Exception
     *
     */
    public function exportProject(Model\Project $project)
    {
        try {
            $taskGroups = array(
                'pedestrian' => array(
                    Model\LabelingTask::INSTRUCTION_PERSON,
                    Model\LabelingTask::INSTRUCTION_CYCLIST,
                    Model\LabelingTask::INSTRUCTION_IGNORE,
                ),
                'vehicle' => array(
                    Model\LabelingTask::INSTRUCTION_VEHICLE,
                    Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                )
            );

            $consideredTasks = array();
            $videoExportIds = array();
            foreach ($taskGroups as $groupName => $groupInstructions) {

                $tasks = $this->getLabeledTasksForProject(
                    $project,
                    $groupInstructions
                );

                $data = array();
                foreach ($tasks as $task) {
                    if (!isset($data[$task->getVideoId()])) {
                        $data[$task->getVideoId()] = array();
                    }
                    switch ($task->getLabelInstruction()) {
                        case Model\LabelingTask::INSTRUCTION_PERSON:
                            $data[$task->getVideoId()] = array_merge($data[$task->getVideoId()], $this->getPedestrianLabelingData($task));
                            break;
                        case Model\LabelingTask::INSTRUCTION_CYCLIST:
                            $data[$task->getVideoId()] = array_merge($data[$task->getVideoId()], $this->getCyclistLabelingData($task));
                            break;
                        case Model\LabelingTask::INSTRUCTION_IGNORE:
                            $data[$task->getVideoId()] = array_merge($data[$task->getVideoId()], $this->getIgnoreLabelingData($task));
                            break;
                        case Model\LabelingTask::INSTRUCTION_VEHICLE:
                            $data[$task->getVideoId()] = array_merge($data[$task->getVideoId()], $this->getVehicleLabelingData($task));
                            break;
                        case Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE:
                            $data[$task->getVideoId()] = array_merge($data[$task->getVideoId()], $this->getVehicleIgnoreLabelingData($task));
                            break;
                    }
                }
                $consideredTasks = array_merge($tasks, $consideredTasks);

                foreach ($data as $videoId => $videoData) {
                    if (empty($videoData)) {
                        continue;
                    }

                    uasort($videoData, function ($a, $b) {
                        if ($a['frame_number'] === $b['frame_number']) {
                            return 0;
                        }
                        return ($a['frame_number'] < $b['frame_number']) ? -1 : 1;
                    });

                    $shortUuidNumbers = array_flip(
                        array_unique(
                            array_map(function ($label) {
                                return $label['uuid'];
                            }, $videoData)
                        )
                    );

                    $videoData = array_map(function ($label) use ($shortUuidNumbers) {
                        $label['id'] = $shortUuidNumbers[$label['uuid']];
                        return $label;
                    }, $videoData);

                    $tempCsvFile = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

                    $fp = fopen($tempCsvFile, 'w');
                    if ($this->headline) {
                        fputcsv($fp, array_keys($videoData[0]), $this->delimiter, $this->enclosure);
                    }
                    foreach ($videoData as $labeledThingInFrame) {
                        fputcsv($fp, $labeledThingInFrame, $this->delimiter, $this->enclosure);
                    }
                    fclose($fp);

                    $video = $this->videoFacade->find($videoId);
                    $filename = sprintf(
                        'export_%s_%s_%s.csv',
                        str_replace(' ', '_', $project->getName()),
                        $groupName,
                        str_replace(' ', '_', $video->getName())
                    );

                    $videoExport = new Model\VideoExport($video, $consideredTasks, $filename, 'text/csv', file_get_contents($tempCsvFile));
                    $this->videoExportFacade->save($videoExport);
                    $videoExportIds[] = $videoExport->getId();
                    if (!unlink($tempCsvFile)) {
                        throw new Exception\Csv(sprintf('Unable to remove temporary csv file at "%s"', $tempCsvFile));
                    }
                }
            }
            $date = new \DateTime('now', new \DateTimeZone('UTC'));
            $projectExport = new Model\ProjectExport($project, $videoExportIds, sprintf('csv_%s.zip', $date->format('Ymd_His')));
            $this->projectExportFacade->save($projectExport);
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * @param Model\LabelingTask $task
     * @return mixed
     */
    public function getIgnoreLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function ($labeledThingInFrame) use ($frameNumberMapping, $labelInstruction) {
                $ignoreType = $this->getClassByRegex('/^(person|cyclist)$/', 1, $labeledThingInFrame);
                return array(
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $labelInstruction . '-' . $ignoreType,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'    => 0,
                    'truncation'   => 0,
                    'direction'    => 'none',
                    'id'           => NULL,
                    'uuid'         => $labeledThingInFrame->getLabeledThingId(),
                );
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabelingTask $task
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
     * @return array
     */
    public function getPedestrianLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function ($labeledThingInFrame) use ($frameNumberMapping, $labelInstruction) {
                $direction   = $this->getClassByRegex('/^(direction-(\w+|(\w+-\w+)))$/', 2, $labeledThingInFrame);
                $occlusion   = $this->getOcclusion($labeledThingInFrame);
                $truncation  = $this->getTruncation($labeledThingInFrame);

                return array(
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $labelInstruction,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'    => $occlusion,
                    'truncation'   => $truncation,
                    'direction'    => $direction,
                    'id'           => NULL,
                    'uuid'         => $labeledThingInFrame->getLabeledThingId(),
                );
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
            function ($labeledThingInFrame) use ($frameNumberMapping, $task) {
                $vehicleType = $this->getClassByRegex(
                    '/^(car|truck|van|2-wheeler-vehicle|bus|misc-vehicle)$/',
                    0,
                    $labeledThingInFrame
                );
                $occlusion   = $this->getOcclusion($labeledThingInFrame);
                $truncation  = $this->getTruncation($labeledThingInFrame);

                $result = array(
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'vehicleType'  => $vehicleType,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'    => $occlusion,
                    'truncation'   => $truncation,
                    'direction'    => null,
                    'id'           => NULL,
                    'uuid'         => $labeledThingInFrame->getLabeledThingId(),
                );

                if ($task->getDrawingTool() === Model\LabelingTask::DRAWING_TOOL_CUBOID) {
                    $video = $this->videoFacade->find($task->getVideoId());
                    $vertices2d = $this->getCuboidVertices($labeledThingInFrame, $video)[0];
                    foreach (range(0, 7) as $vertexPoint) {
                        $result['vertex_2d_' . $vertexPoint . '_x'] = ($vertices2d[$vertexPoint][0] === null) ? 'null' : round($vertices2d[$vertexPoint][0], 4);
                        $result['vertex_2d_' . $vertexPoint . '_y'] = ($vertices2d[$vertexPoint][1] === null) ? 'null' : round($vertices2d[$vertexPoint][1], 4);
                    }

                    $vertices3d = $labeledThingInFrame->getShapes()[0]['vehicleCoordinates'];
                    foreach (range(0, 7) as $vertexPoint) {
                        $result['vertex_3d_' . $vertexPoint . '_x'] = ($vertices3d[$vertexPoint][0] === null) ? 'null' : round($vertices3d[$vertexPoint][0], 4);
                        $result['vertex_3d_' . $vertexPoint . '_y'] = ($vertices3d[$vertexPoint][1] === null) ? 'null' : round($vertices3d[$vertexPoint][1], 4);
                        $result['vertex_3d_' . $vertexPoint . '_z'] = ($vertices3d[$vertexPoint][2] === null) ? 'null' : round($vertices3d[$vertexPoint][2], 4);
                    }

                }

                return $result;
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    /**
     * @param Model\LabelingTask $task
     * @return mixed
     */
    public function getVehicleIgnoreLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function ($labeledThingInFrame) use ($frameNumberMapping, $labelInstruction) {
                $ignoreType = $this->getClassByRegex('/^(ignore-vehicle)$/', 1, $labeledThingInFrame);
                $result = array(
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $ignoreType,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                    'occlusion'    => 0,
                    'truncation'   => 0,
                    'direction'    => null,
                    'id'           => NULL,
                    'uuid'         => $labeledThingInFrame->getLabeledThingId(),
                );
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
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @return int|string
     */
    private function getOcclusion(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        switch ($this->getClassByRegex('/^(occlusion-(\d{1,2}|(\d{1,2}-\d{1,2})))$/', 2, $labeledThingInFrame)) {
            case '0':
                return 0;
            break;
            case '25':
                return 1;
            break;
            case '25-50':
                return 2;
            break;
            case '50':
                return 3;
            break;
            default:
                return 'unknown';
        }
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     * @return int|string
     */
    private function getTruncation(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        switch ($this->getClassByRegex('/^(truncation-(\d{1,2}|\d{1,2}-\d{1,2}))$/', 2, $labeledThingInFrame)) {
            case '0':
                return 0;
            break;
            case '25':
                return 1;
            break;
            case '25-50':
                return 2;
            break;
            case '50':
                return 3;
            break;
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
        $builder = new Service\ProjectExporter\Extractor\RegexBuilder();
        $builder->setRegexPattern($regex);
        $builder->setGroupName($groupName);
        $regexExtractor = $builder->getRegexExtractor();

        return $regexExtractor->extract($labeledThingInFrame);
    }

    private function getCuboidVertices(Model\LabeledThingInFrame $labeledThingInFrame, Model\Video $video)
    {
        $shapes = $labeledThingInFrame->getShapes();
        $shape = Shape::createFromArray($shapes[0]);
        
        if ($shape->getType() !== 'cuboid3d') {
            throw new \Exception('Unsupported type ' . $shape->getType());
        }

        return $this->depthBufferService->getVertices($shape, $video->getCalibration());
    }

    /**
     * @param Model\LabeledThing $labeledThingInFrame
     *
     * @return array
     */
    private function getPosition($labeledThingInFrame)
    {
        $shapes = $labeledThingInFrame->getShapes();
        if (count($shapes) === 0) {
            return array(
                'x' => 'null',
                'y' => 'null',
            );
        }

        $shape = Shape::createFromArray($shapes[0]);

        switch ($shape->getType()) {
            case 'rectangle':
                return array(
                    'x' => (int)round($shape->getLeft()),
                    'y' => (int)round($shape->getTop()),
                );
                break;
            case 'pedestrian':
                $heightHalf = ($shape->getBottomCenterY() - $shape->getTopCenterY()) / 2;
                $widthHalf  = $heightHalf * 0.41;
                return array(
                    'x' => (int) ($shape->getTopCenterX() - $widthHalf),
                    'y' => (int) $shape->getTopCenterY(),
                );
                break;
            default:
                return array(
                    'x' => 'null',
                    'y' => 'null',
                );
        }
    }

    /**
     * @param Model\LabeledThing $labeledThingInFrame
     *
     * @return array
     */
    private function getDimensions($labeledThingInFrame)
    {
        $shapes = $labeledThingInFrame->getShapes();
        if (count($shapes) === 0) {
            return array(
                'width'  => 'null',
                'height' => 'null',
            );
        }

        $shape = Shape::createFromArray($shapes[0]);

        switch ($shape->getType()) {
            case 'rectangle':
                return array(
                    'width'  => (int)round($shape->getWidth()),
                    'height' => (int)round($shape->getHeight()),
                );
                break;
            case 'pedestrian':
                $heightHalf = ($shape->getBottomCenterY() - $shape->getTopCenterY()) / 2;
                $widthHalf  = $heightHalf * 0.41;
                return array(
                    'width'  => (int)round($widthHalf*2),
                    'height' => (int)round(($shape->getBottomCenterY() - $shape->getTopCenterY())),
                );
                break;
            default:
                return array(
                    'width'  => 'null',
                    'height' => 'null',
                );
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
     * @param array $requiredTasksInstructions
     * @return mixed
     * @throws \Exception
     */
    public function getLabeledTasksForProject(Model\Project $project, array $requiredTasksInstructions)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);

        $taskInstructions = array_map(function(Model\LabelingTask $task) {
            return $task->getLabelInstruction();
        }, $tasks);

        if (count(array_intersect($taskInstructions, $requiredTasksInstructions)) === 0) {
            return array();
        }

        $labeledTasks = array_filter($tasks, function(Model\LabelingTask $task) use ($requiredTasksInstructions){
            return in_array($task->getLabelInstruction(), $requiredTasksInstructions) && $task->getStatus() === Model\LabelingTask::STATUS_LABELED;
        });

        $labeledTaskInstructions = array_map(function(Model\LabelingTask $task) {
            return $task->getLabelInstruction();
        }, $labeledTasks);

        // If the required types are missing, return no tasks
        if (count(array_unique(array_intersect($labeledTaskInstructions, $requiredTasksInstructions))) !== count($requiredTasksInstructions)) {
            return array();
        }

        foreach ($labeledTasks as $labeledTask) {
            if (count($this->labeledThingInFrameFacade->getIncompleteLabeledThingsInFrame($labeledTask)) > 0) {
                throw new \Exception('Task not completed');
            }
        }

        return $labeledTasks;
    }
}