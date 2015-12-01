<?php

namespace AppBundle\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Model\TaskExporter;
use AppBundle\Service;
use AppBundle\Service\TaskExporter\Exception;

/**
 * @todo create zip archive
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
     */
    static public function getRowForObject(TaskExporter\Kitti\Object $object)
    {
        return sprintf(
            '%s %.2f %d %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f',
            $object->getType(),                     // type
            -1,                                     // trucation
            -1,                                     // occlusion
            -10,                                    // alpha [-pi, pi]
            $object->getBoundingBox()->getLeft(),   // bounding-box-left in pixels
            $object->getBoundingBox()->getTop(),    // bounding-box-top in pixels
            $object->getBoundingBox()->getRight(),  // bounding-box-right in pixels
            $object->getBoundingBox()->getBottom(), // bounding-box-bottom in pixels
            -1,                                     // height in meters
            -1,                                     // width in meters
            -1,                                     // length in meters
            -1000,                                  // 3d-location-x in camera coordinates (in meters)
            -1000,                                  // 3d-location-y in camera coordinates (in meters)
            -1000,                                  // 3d-location-z in camera coordinates (in meters)
            -10,                                    // rotation around y-axis [-pi, pi]
            1                                       // detection confidence (higher is better)
        );
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
                $content = implode("\n", array_map([self::class, 'getRowForObject'], $objects));

                if (!$zip->addFromString($filename, $content)) {
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

        $labeledThings = $this->labelingTaskFacade->getLabeledThings($task);

        foreach ($labeledThings as $labeledThing) {
            $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
            foreach ($labeledThingsInFrame as $labeledThingInFrame) {
                if ($labeledThingInFrame->getIncomplete()) {
                    // TODO: it makes no sense to export incomplete things but
                    // we may want to generate some warnings if incomplete
                    // things are found
                    continue;
                }

                try {
                    $result[$labeledThingInFrame->getFrameNumber()][] = new TaskExporter\Kitti\Object(
                        $this->getObjectType($labeledThingInFrame),
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
        }

        return $this->sortResult($result);
    }

    /**
     * Get the object type for the given labeledThingInFrame.
     *
     * @return string
     *
     * @throws Exception\Kitti
     */
    private function getObjectType(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        foreach ($labeledThingInFrame->getClasses() as $class) {
            if (isset(static::$objectTypeMap[$class])) {
                return static::$objectTypeMap[$class];
            }
        }

        throw new Exception\Kitti('Unknown labeled thing in frame');
    }

    /**
     * Sort the result array according to the bounding boxes.
     *
     * This is required because the labeled things are fetched in order of
     * their internal id which is an uuid and therefore their order is
     * unpredictable which is a problem in automated tests.
     *
     * The sorting functionality is placed here because it doesn't matter for
     * the export and this way, the tests are not cluttered by this.
     *
     * @param array $input
     *
     * @return array
     */
    private function sortResult(array $input)
    {
        $result = $input;

        foreach ($result as $frameNumber => $entries) {
            usort($entries, function($a, $b) {
                if ($a->getBoundingBox()->getLeft() < $b->getBoundingBox()->getLeft()) {
                    return -1;
                } elseif ($a->getBoundingBox()->getLeft() > $b->getBoundingBox()->getLeft()) {
                    return 1;
                } elseif ($a->getBoundingBox()->getTop() < $b->getBoundingBox()->getTop()) {
                    return -1;
                } elseif ($a->getBoundingBox()->getTop() > $b->getBoundingBox()->getTop()) {
                    return 1;
                } elseif ($a->getBoundingBox()->getRight() < $b->getBoundingBox()->getRight()) {
                    return -1;
                } elseif ($a->getBoundingBox()->getRight() > $b->getBoundingBox()->getRight()) {
                    return 1;
                } elseif ($a->getBoundingBox()->getBottom() < $b->getBoundingBox()->getBottom()) {
                    return -1;
                } elseif ($a->getBoundingBox()->getBottom() > $b->getBoundingBox()->getBottom()) {
                    return 1;
                }
                return 0;
            });

            $result[$frameNumber] = $entries;
        }

        return $result;
    }
}
