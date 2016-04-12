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
     * Csv constructor.
     *
     * @param Service\GhostClassesPropagation $ghostClassesPropagationService
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\ProjectExport $projectExportFacade
     * @param Facade\Project $projectFacade
     * @param bool $headline
     * @param string $delimiter
     * @param string $enclosure
     */
    public function __construct(
        Service\GhostClassesPropagation $ghostClassesPropagationService,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\ProjectExport $projectExportFacade,
        Facade\Project $projectFacade,
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
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        try {
            $zip = new \ZipArchive();
            if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new Exception\Csv(sprintf('Unable to open zip archive at "%s"', $zipFilename));
            }

            $taskGroups = array(
                'pedestrian' => array(
                    Model\LabelingTask::INSTRUCTION_PERSON,
                    Model\LabelingTask::INSTRUCTION_CYCLIST,
                    Model\LabelingTask::INSTRUCTION_IGNORE,
                ),
                'vehicle' => array(
                    Model\LabelingTask::INSTRUCTION_VEHICLE,
                )
            );

            $consideredTasks = array();
            foreach($taskGroups as $groupName => $groupInstructions) {

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
                    }
                }
                foreach($data as $videoId => $videoData) {
                    if (empty($videoData)) {
                        continue;
                    }
                    $consideredTasks = array_merge($tasks, $consideredTasks);

                    uasort($videoData, function ($a, $b) {
                        if ($a['frame_number'] === $b['frame_number']) {
                            return 0;
                        }
                        return ($a['frame_number'] < $b['frame_number']) ? -1 : 1;
                    });

                    $idCounter = 0;
                    $videoData = array_map(function ($label) use (&$idCounter) {
                        $idCounter++;
                        $id = array('id' => $idCounter);
                        return $id + $label;
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

                    if (!$zip->addFile($tempCsvFile, sprintf('export_%s_%s_%s.csv', $groupName, $videoId, $project->getId()))) {
                        throw new Exception\Csv('Unable to add file to zip archive');
                    }
                }
            }

            $zip->close();

            $result = file_get_contents($zipFilename);

            if ($result === false) {
                throw new Exception\Csv(sprintf('Unable to read file at "%s"', $zipFilename));
            }

            $date = new \DateTime('now', new \DateTimeZone('UTC'));

            $projectExport = new Model\ProjectExport($project, $consideredTasks, sprintf('csv_%s.zip', $date->format('Ymd_His')), 'application/zip', $result);
            $this->projectExportFacade->save($projectExport);

            if (!unlink($zipFilename)) {
                throw new Exception\Csv(sprintf('Unable to remove temporary zip file at "%s"', $zipFilename));
            }
            if (!unlink($tempCsvFile)) {
                throw new Exception\Csv(sprintf('Unable to remove temporary csv file at "%s"', $tempCsvFile));
            }

            return $projectExport->getRawData();
        } catch (\Exception $e) {
            @unlink($zipFilename);
            throw $e;
        }
    }

    /**
     * @param Model\LabelingTask $task
     * @return mixed
     */
    private function getIgnoreLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function ($labeledThingInFrame) use (&$idCounter, $frameNumberMapping, $labelInstruction) {
                return array(
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $labelInstruction,
                    'direction'    => 'none',
                    'occlusion'    => 0,
                    'truncation'   => 0,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                );
            },
            $labeledThingsInFramesWithGhostClasses
        );
    }

    private function getCyclistLabelingData(Model\LabelingTask $task)
    {
        return $this->getPedestrianLabelingData($task);
    }

    /**
     * Get the pedestrian labeling data
     *
     * @param Model\LabelingTask $task
     */
    private function getPedestrianLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();
        $labelInstruction                      = $task->getLabelInstruction();

        return array_map(
            function ($labeledThingInFrame) use (&$idCounter, $frameNumberMapping, $labelInstruction) {
                $direction   = $this->getClassByRegex('/^(direction-(\w+|(\w+-\w+)))$/', 2, $labeledThingInFrame);
                $occlusion   = $this->getClassByRegex('/^(occlusion-(\d{1,2}|(\d{1,2}-\d{1,2})))$/', 2, $labeledThingInFrame);
                $truncation  = $this->getClassByRegex('/^(truncation-(\d{1,2}|\d{1,2}-\d{1,2}))$/', 2, $labeledThingInFrame);

                return array(
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'label_class'  => $labelInstruction,
                    'direction'    => $direction,
                    'occlusion'    => $occlusion,
                    'truncation'   => $truncation,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
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
    private function getVehicleLabelingData(Model\LabelingTask $task)
    {
        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);
        $frameNumberMapping                    = $task->getFrameNumberMapping();

        return array_map(
            function ($labeledThingInFrame) use (&$idCounter, $frameNumberMapping) {
                $vehicleType = $this->getClassByRegex(
                    '/^(car|truck|2-wheeler-vehicle|bus|misc-vehicle|ignore-vehicle)$/',
                    0,
                    $labeledThingInFrame
                );
                $direction   = $this->getClassByRegex('/^(direction-(\w+))$/', 2, $labeledThingInFrame);
                $occlusion   = $this->getClassByRegex('/^(occlusion-(\d{2}|(\d{2}-\d{2})))$/', 2, $labeledThingInFrame);
                $truncation  = $this->getClassByRegex('/^(truncation-(\d{2}|\d{2}-\d{2}))$/', 2, $labeledThingInFrame);

                return array(
                    'frame_number' => $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                    'vehicleType'  => $vehicleType,
                    'direction'    => $direction,
                    'occlusion'    => $occlusion,
                    'truncation'   => $truncation,
                    'position_x'   => $this->getPosition($labeledThingInFrame)['x'],
                    'position_y'   => $this->getPosition($labeledThingInFrame)['y'],
                    'width'        => $this->getDimensions($labeledThingInFrame)['width'],
                    'height'       => $this->getDimensions($labeledThingInFrame)['height'],
                );
            },
            $labeledThingsInFramesWithGhostClasses
        );
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
                'x' => 'NAN',
                'y' => 'NAN',
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
                    'x' => 'NAN',
                    'y' => 'NAN',
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
                'width'  => 'NAN',
                'height' => 'NAN',
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
                    'width'  => 'NAN',
                    'height' => 'NAN',
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

        if (count(array_unique(array_intersect($labeledTaskInstructions, $requiredTasksInstructions))) !== count($requiredTasksInstructions)) {
            throw new \Exception('Required types not labeled yet');
        }

        foreach ($labeledTasks as $labeledTask) {
            if (count($this->labeledThingInFrameFacade->getIncompleteLabeledThingsInFrame($labeledTask)) > 0) {
                throw new \Exception('Task not completed');
            }
        }

        return $labeledTasks;
    }
}