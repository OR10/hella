<?php

namespace AppBundle\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\TaskExporter;
use AppBundle\Service;
use AppBundle\Service\TaskExporter\Exception;

/**
 * Service to export a task for the K.I.T.T.I. Object Detection Benchmark
 * (http://www.cvlibs.net/datasets/kitti/eval_object.php).
 */
class Kitti implements Service\TaskExporter
{
    /**
     * This map maps a specific labeling class to a known object type of the
     * KITTI exporter.
     */
    static $objectTypeMap = [
        'pedestrian' => 'Pedestrian',
        'cyclist'    => 'Cyclist',
        'car'        => 'Car',
    ];

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
     * @var Facade\TaskExport
     */
    private $taskExportFacade;

    /**
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\TaskExport          $taskExportFacade
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\TaskExport $taskExportFacade
    ) {
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->taskExportFacade          = $taskExportFacade;
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return string containing the raw content of a zip archive.
     */
    public function exportLabelingTask(Model\LabelingTask $task)
    {
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-kitti-');

        try {
            $data = $this->getInternalExportData($task);

            $zip = new \ZipArchive();
            if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new Exception\Kitti(sprintf('Unable to open zip archive at "%s"', $zipFilename));
            }

            foreach ($data as $frameNumber => $objects) {
                $filename = sprintf('%06d.txt', $frameNumber);

                if (!$zip->addFromString($filename, implode("\n", $objects))) {
                    throw new Exception\Kitti(
                        sprintf(
                            'Unable to add file "%s" for frame "%d" to zip archive',
                            $filename,
                            $frameNumber
                        )
                    );
                }
            }

            $zip->close();

            $result = file_get_contents($zipFilename);

            if ($result === false) {
                throw new Exception\Kitti(sprintf('Unable to read file at "%s"', $zipFilename));
            }

            $taskExport = new Model\TaskExport($task, 'kitti.zip', 'application/zip', $result);
            $this->taskExportFacade->save($taskExport);

            if (!unlink($zipFilename)) {
                throw new Exception\Kitti(sprintf('Unable to remove temorary file at "%s"', $zipFilename));
            }

            return $taskExport->getRawData();
        } catch (\Exception $e) {
            @unlink($zipFilename);
            throw $e;
        }
    }

    /**
     * Get the internally used export data for the given task.
     *
     * This method is declared public because this is the method used by the
     * tests since PHP's `ZipArchive` class works directly with files which is
     * really horrible to test.
     *
     * @todo normalize frame numbers to start at zero?
     *
     * @param Model\LabelingTask $task
     *
     * @return array of an internal representation of objects per frame and
     *               their normalized bounding boxes.
     */
    public function getInternalExportData(Model\LabelingTask $task)
    {
        $result = array_fill(
            $task->getFrameRange()->getStartFrameNumber(),
            $task->getFrameRange()->getNumberOfFrames(),
            []
        );

        $labeledThingsInFrame = $this->labelingTaskFacade->getLabeledThingsInFrame($task);
        $labeledThingIds = array_values(
            array_unique(
                array_map(
                    function(Model\LabeledThingInFrame $labeledThingInFrame) {
                        return $labeledThingInFrame->getLabeledThingId();
                    },
                    $labeledThingsInFrame
                )
            )
        );

        $labeledThings = [];
        foreach ($this->labeledThingFacade->getLabeledThingsById($labeledThingIds) as $labeledThing) {
            $labeledThings[$labeledThing->getId()] = $labeledThing;
        }

        foreach ($labeledThingsInFrame as $labeledThingInFrame) {
            if ($labeledThingInFrame->getIncomplete()) {
                // TODO: it makes no sense to export incomplete things but
                // we may want to generate some warnings if incomplete
                // things are found
                continue;
            }

            try {
                $result[$labeledThingInFrame->getFrameNumber()][] = new TaskExporter\Kitti\Object(
                    $this->getObjectType($labeledThings[$labeledThingInFrame->getLabeledThingId()]),
                    $labeledThingInFrame->getBoundingBox()
                );
            } catch (\Exception $exception) {
                throw new Exception\Kitti(
                    $exception->getMessage(),
                    $labeledThingInFrame->getFrameNumber(),
                    $exception
                );
            }
        }

        return $result;
    }

    /**
     * Get the object type for the given labeledThingInFrame.
     *
     * @return string
     *
     * @throws Exception\Kitti
     */
    private function getObjectType(Model\LabeledThing $labeledThing)
    {
        foreach ($labeledThing->getClasses() as $class) {
            if (isset(static::$objectTypeMap[$class])) {
                return static::$objectTypeMap[$class];
            }
        }

        throw new Exception\Kitti('Unknown labeled thing');
    }
}
