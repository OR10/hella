<?php

namespace AppBundle\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\Shape;
use AppBundle\Model\TaskExporter;
use AppBundle\Service;
use AppBundle\Service\TaskExporter\Exception;

class Csv implements Service\TaskExporter
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\TaskExport
     */
    private $taskExportFacade;

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
     * Csv constructor.
     *
     * @param Service\GhostClassesPropagation $ghostClassesPropagationService
     * @param Facade\LabeledThingInFrame      $labeledThingInFrameFacade
     * @param Facade\TaskExport               $taskExportFacade
     * @param bool                            $headline
     * @param string                          $delimiter
     * @param string                          $enclosure
     */
    public function __construct(
        Service\GhostClassesPropagation $ghostClassesPropagationService,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\TaskExport $taskExportFacade,
        $headline = true,
        $delimiter = ',',
        $enclosure = '"'
    ) {
        $this->ghostClassesPropagationService = $ghostClassesPropagationService;
        $this->labeledThingInFrameFacade      = $labeledThingInFrameFacade;
        $this->taskExportFacade               = $taskExportFacade;
        $this->headline                       = $headline;
        $this->delimiter                      = $delimiter;
        $this->enclosure                      = $enclosure;
    }

    /**
     * Export data for the given task.
     *
     * @param Model\LabelingTask $task
     *
     * @return mixed
     * @throws \Exception
     */
    public function exportLabelingTask(Model\LabelingTask $task)
    {
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        try {
            $zip = new \ZipArchive();
            if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new Exception\Csv(sprintf('Unable to open zip archive at "%s"', $zipFilename));
            }

            $data = $this->getVehicleLabelingData($task);

            $tempCsvFile = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

            $fp = fopen($tempCsvFile, 'w');
            if ($this->headline) {
                fputcsv($fp, array_keys($data[0]), $this->delimiter, $this->enclosure);
            }
            foreach ($data as $labeledThingInFrame) {
                fputcsv($fp, $labeledThingInFrame, $this->delimiter, $this->enclosure);
            }
            fclose($fp);

            if (!$zip->addFile($tempCsvFile, sprintf('export_%s.csv', $task->getId()))) {
                throw new Exception\Csv('Unable to add file to zip archive');
            }

            $zip->close();

            $result = file_get_contents($zipFilename);

            if ($result === false) {
                throw new Exception\Csv(sprintf('Unable to read file at "%s"', $zipFilename));
            }

            $taskExport = new Model\TaskExport($task, 'csv.zip', 'application/zip', $result);
            $this->taskExportFacade->save($taskExport);

            if (!unlink($zipFilename)) {
                throw new Exception\Csv(sprintf('Unable to remove temporary zip file at "%s"', $zipFilename));
            }
            if (!unlink($tempCsvFile)) {
                throw new Exception\Csv(sprintf('Unable to remove temporary csv file at "%s"', $tempCsvFile));
            }

            return $taskExport->getRawData();
        } catch (\Exception $e) {
            @unlink($zipFilename);
            throw $e;
        }
    }

    /**
     * @param Model\LabelingTask $task
     */
    public function getPedestrianLabelingData(Model\LabelingTask $task)
    {
        // TODO: Implement method.
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return array
     */
    public function getVehicleLabelingData(Model\LabelingTask $task)
    {
        $idCounter = 0;

        $labeledThingsInFramesWithGhostClasses = $this->loadLabeledThingsInFrame($task);

        return array_map(
            function ($labeledThingInFrame) use (&$idCounter) {
                $idCounter++;

                $vehicleType = $this->getClassByRegex(
                    '/^(car|truck|2-wheeler-vehicle|bus|misc-vehicle|ignore-vehicle)$/',
                    0,
                    $labeledThingInFrame
                );
                $direction   = $this->getClassByRegex('/^(direction-(\w+))$/', 2, $labeledThingInFrame);
                $occlusion   = $this->getClassByRegex('/^(occlusion-(\d{2}|(\d{2}-\d{2})))$/', 2, $labeledThingInFrame);
                $truncation  = $this->getClassByRegex('/^(truncation-(\d{2}|\d{2}-\d{2}))$/', 2, $labeledThingInFrame);

                return array(
                    'id'           => $idCounter,
                    'frame_number' => $labeledThingInFrame->getFrameNumber(),
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
        $builder = new Service\TaskExporter\Extractor\RegexBuilder();
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
                    'x' => round($shape->getLeft()),
                    'y' => round($shape->getTop()),
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
                    'width'  => round($shape->getWidth()),
                    'height' => round($shape->getHeight()),
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
}