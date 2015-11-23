<?php

namespace AppBundle\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Service\TaskExporter\Exception;

/**
 * @todo create zip archive
 */
class Kitti implements Service\TaskExporter
{
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

            foreach ($data as $frameNumber => $entries) {
                $filename = sprintf('%06d.txt', $frameNumber);
                $content = [];

                foreach ($entries as $entry) {
                    $content[] = sprintf(
                        '%s %.2f %d %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f %.2f',
                        $entry['type'],                  // type
                        -1,                              // trucation
                        -1,                              // occlusion
                        -10,                             // alpha [-pi, pi]
                        $entry['boundingBox']['left'],   // bounding-box-left in pixels
                        $entry['boundingBox']['top'],    // bounding-box-top in pixels
                        $entry['boundingBox']['right'],  // bounding-box-right in pixels
                        $entry['boundingBox']['bottom'], // bounding-box-bottom in pixels
                        -1,                              // height in meters
                        -1,                              // width in meters
                        -1,                              // length in meters
                        -1000,                           // 3d-location-x in camera coordinates (in meters)
                        -1000,                           // 3d-location-y in camera coordinates (in meters)
                        -1000,                           // 3d-location-z in camera coordinates (in meters)
                        -10,                             // rotation around y-axis [-pi, pi]
                        1                                // detection confidence (higher is better)
                    );
                }

                if (!$zip->addFromString($filename, implode("\n", $content))) {
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
                try {
                    $result[$labeledThingInFrame->getFrameNumber()][] = [
                        'type'        => $this->getObjectType($labeledThingInFrame),
                        'boundingBox' => $this->getOverallBoundingBox($labeledThingInFrame->getShapes()),
                    ];
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
        $objectTypeMap = [
            'pedestrian' => 'Pedestrian',
            'cyclist'    => 'Cyclist',
            'car'        => 'Car',
        ];

        foreach ($labeledThingInFrame->getClasses() as $class) {
            if (isset($objectTypeMap[$class])) {
                return $objectTypeMap[$class];
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
                if ($a['boundingBox']['left'] < $b['boundingBox']['left']) {
                    return -1;
                } elseif ($a['boundingBox']['left'] > $b['boundingBox']['left']) {
                    return 1;
                } elseif ($a['boundingBox']['top'] < $b['boundingBox']['top']) {
                    return -1;
                } elseif ($a['boundingBox']['top'] > $b['boundingBox']['top']) {
                    return 1;
                } elseif ($a['boundingBox']['right'] < $b['boundingBox']['right']) {
                    return -1;
                } elseif ($a['boundingBox']['right'] > $b['boundingBox']['right']) {
                    return 1;
                } elseif ($a['boundingBox']['bottom'] < $b['boundingBox']['bottom']) {
                    return -1;
                } elseif ($a['boundingBox']['bottom'] > $b['boundingBox']['bottom']) {
                    return 1;
                }
                return 0;
            });

            $result[$frameNumber] = $entries;
        }

        return $result;
    }

    /**
     * Get a bounding box for all given shapes.
     *
     * @return array
     */
    private function getOverallBoundingBox(array $shapes)
    {
        if (empty($shapes)) {
            throw new Exception\Kitti('Empty shapes');
        }

        $boundingBox = null;

        foreach ($shapes as $shape) {
            $shapeBoundingBox = $this->getBoundingBox($shape);
            if ($boundingBox === null) {
                $boundingBox = $shapeBoundingBox;
            } else {
                $boundingBox = [
                    'left'   => min($boundingBox['left'], $shapeBoundingBox['left']),
                    'top'    => min($boundingBox['top'], $shapeBoundingBox['top']),
                    'right'  => max($boundingBox['right'], $shapeBoundingBox['right']),
                    'bottom' => max($boundingBox['bottom'], $shapeBoundingBox['bottom']),
                ];
            }
        }

        return $boundingBox;
    }

    /**
     * Get the bounding box for the given shape.
     *
     * @return array
     *
     * @throws Exception\Kitti
     */
    private function getBoundingBox(array $shape)
    {
        if (!isset($shape['type'])) {
            throw new Exception\Kitti('Invalid shape');
        }

        $boundingBoxCalculators = [
            'rectangle' => function($shape) {
                if (!isset($shape['topLeft']['x'])
                    || !isset($shape['topLeft']['y'])
                    || !isset($shape['bottomRight']['x'])
                    || !isset($shape['bottomRight']['y'])
                ) {
                    throw new Exception\Kitti('Invalid rectangle shape');
                }

                return [
                    'left'   => $shape['topLeft']['x'],
                    'top'    => $shape['topLeft']['y'],
                    'right'  => $shape['bottomRight']['x'],
                    'bottom' => $shape['bottomRight']['y'],
                ];
            },
            // ellipse handles ellipse and circle
            'ellipse' => function($shape) {
                if (!isset($shape['point']['x'])
                    || !isset($shape['point']['y'])
                    || !isset($shape['size']['width'])
                    || !isset($shape['size']['height'])
                ) {
                    throw new Exception\Kitti('Invalid ellipse shape');
                }

                return [
                    'left'   => $shape['point']['x'],
                    'top'    => $shape['point']['y'],
                    'right'  => $shape['point']['x'] + $shape['size']['width'],
                    'bottom' => $shape['point']['y'] + $shape['size']['height'],
                ];
            },
            // polygon handles polygon and line
            'polygon' => function($shape) {
                if (!isset($shape['points']) || !is_array($shape['points'])) {
                    throw new Exception\Kitti('Invalid polygon shape');
                }

                if (empty($shape['points'])) {
                    throw new Exception\Kitti('Empty point list for polygons is not allowed');
                }

                foreach ($shape['points'] as $point) {
                    if (!isset($point['x']) || !isset($point['y'])) {
                        throw new Exception\Kitti('Invalid point in polygon shape');
                    }
                }

                $result = [
                    'left'   => $shape['points'][0]['x'],
                    'top'    => $shape['points'][0]['y'],
                    'right'  => $shape['points'][0]['x'],
                    'bottom' => $shape['points'][0]['y'],
                ];

                foreach ($shape['points'] as $point) {
                    $result['left']   = min($result['left'], $point['x']);
                    $result['top']    = min($result['top'], $point['y']);
                    $result['right']  = max($result['right'], $point['x']);
                    $result['bottom'] = max($result['bottom'], $point['y']);
                }

                return $result;
            },
        ];

        if (isset($boundingBoxCalculators[$shape['type']])) {
            return $boundingBoxCalculators[$shape['type']]($shape);
        }

        throw new Exception\Kitti("Unsupported shape type: {$shape['type']}");
    }
}
