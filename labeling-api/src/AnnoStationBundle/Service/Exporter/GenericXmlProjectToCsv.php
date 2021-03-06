<?php
namespace AnnoStationBundle\Service\Exporter;

use AppBundle\Model;
use AnnoStationBundle\Helper\Iterator;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Helper\Export;
use AnnoStationBundle\Helper\Export\Column;
use AnnoStationBundle\Service;
use AnnoStationBundle\Helper\Export\ColumnGroup;

class GenericXmlProjectToCsv
{
    /**
     * @var Facade\Exporter
     */
    private $exporterFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Service\ColumnGroupFactory
     */
    private $columnGroupFactory;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Service\ShapeColumnsFactory
     */
    private $shapeColumnsFactory;

    /**
     * @var Service\TaskConfigurationXmlConverterFactory
     */
    private $configurationXmlConverterFactory;
    /**
     * @var Service\ClassColumnsFactory
     */
    private $classColumnsFactory;
    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfiguration;
    /**
     * @var Service\GhostClassesPropagation
     */
    private $ghostClassesPropagation;

    /**
     * @var Facade\CalibrationData
     */
    private $calibrationDataFacade;

    /**
     * @param Facade\Exporter                              $exporterFacade
     * @param Facade\Project                               $projectFacade
     * @param Facade\LabeledThingInFrame                   $labeledThingInFrameFacade
     * @param Facade\Video                                 $videoFacade
     * @param Facade\LabelingTask                          $labelingTaskFacade
     * @param Service\ColumnGroupFactory                   $columnGroupFactory
     * @param Service\ShapeColumnsFactory                  $shapeColumnsFactory
     * @param Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory
     * @param Service\ClassColumnsFactory                  $classColumnsFactory
     * @param Facade\TaskConfiguration                     $taskConfiguration
     * @param Service\GhostClassesPropagation              $ghostClassesPropagation
     * @param Facade\CalibrationData                       $calibrationDataFacade
     */
    public function __construct(
        Facade\Exporter $exporterFacade,
        Facade\Project $projectFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Service\ColumnGroupFactory $columnGroupFactory,
        Service\ShapeColumnsFactory $shapeColumnsFactory,
        Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory,
        Service\ClassColumnsFactory $classColumnsFactory,
        Facade\TaskConfiguration $taskConfiguration,
        Service\GhostClassesPropagation $ghostClassesPropagation,
        Facade\CalibrationData $calibrationDataFacade
    ) {
        $this->exporterFacade                   = $exporterFacade;
        $this->projectFacade                    = $projectFacade;
        $this->labeledThingInFrameFacade        = $labeledThingInFrameFacade;
        $this->columnGroupFactory               = $columnGroupFactory;
        $this->videoFacade                      = $videoFacade;
        $this->labelingTaskFacade               = $labelingTaskFacade;
        $this->shapeColumnsFactory              = $shapeColumnsFactory;
        $this->configurationXmlConverterFactory = $configurationXmlConverterFactory;
        $this->classColumnsFactory              = $classColumnsFactory;
        $this->taskConfiguration                = $taskConfiguration;
        $this->ghostClassesPropagation          = $ghostClassesPropagation;
        $this->calibrationDataFacade            = $calibrationDataFacade;
    }

    /**
     * @param Model\Export $export
     *
     * @throws \Exception
     */
    public function export(Model\Export $export)
    {
        $export = $this->exporterFacade->find($export->getId());
        $export->setStatus(Model\Export::EXPORT_STATUS_IN_PROGRESS);
        $this->exporterFacade->save($export);

        try {
            $zipData            = array();
            $project            = $this->projectFacade->find($export->getProjectId());
            $videoIterator      = new Iterator\Video($this->projectFacade, $this->videoFacade, $project);
            $taskConfigurations = [];
            foreach ($videoIterator as $video) {
                $videoCalibration = null;
                if ($video->getCalibrationId() !== null) {
                    $videoCalibration = $this->calibrationDataFacade->findById($video->getCalibrationId());
                }
                /** @var ColumnGroup\Unique $objectLabelingColumnGroup */
                $objectLabelingColumnGroup = $this->columnGroupFactory->create(Service\ColumnGroupFactory::UNIQUE);
                /** @var ColumnGroup\Unique $metaLabelingColumnGroup */
                $metaLabelingColumnGroup = $this->columnGroupFactory->create(Service\ColumnGroupFactory::UNIQUE);

                // generate columns for this Video
                $labelingTaskIterator = new Iterator\LabelingTask($this->labelingTaskFacade, $video);
                /** @var Model\LabelingTask $task */
                foreach ($labelingTaskIterator as $task) {
                    $xmlConfiguration                 = $this->taskConfiguration->find($task->getTaskConfigurationId());
                    $configurationXmlConverterFactory = $this->configurationXmlConverterFactory->createConverter(
                        $xmlConfiguration->getRawData(),
                        $xmlConfiguration->getType()
                    );

                    if ($xmlConfiguration->isMetaLabelingConfiguration()) {
                        $metaLabelingColumnGroup->addColumns(
                            [
                                new Column\LabeledFrame\Uuid(),
                                new Column\LabeledFrame\FrameNumber(),
                            ]
                        );
                        $metaLabelingColumnGroup->addColumns(
                            $this->classColumnsFactory->createLabeledFrameColumns(
                                $configurationXmlConverterFactory->getClassStructure()
                            )
                        );
                    } else {
                        $objectLabelingColumnGroup->addColumns(
                            [
                                new Column\LabeledThingInFrame\Uuid(),
                                new Column\LabeledThingInFrame\FrameNumber(),
                            ]
                        );
                        $objectLabelingColumnGroup->addColumns(
                            $this->shapeColumnsFactory->create($task->getDrawingTool())
                        );
                        $objectLabelingColumnGroup->addColumns(
                            $this->classColumnsFactory->createLabeledThingInFrameColumns(
                                $configurationXmlConverterFactory->getClassStructure()
                            )
                        );
                    }

                    $taskConfigurations[$task->getTaskConfigurationId()] = $xmlConfiguration;
                }

                $objectLabelingTable = new Export\Table($objectLabelingColumnGroup);
                $metaLabelingTable   = new Export\Table($metaLabelingColumnGroup);
                foreach ($labelingTaskIterator as $task) {
                    $xmlConfiguration = $this->taskConfiguration->find($task->getTaskConfigurationId());
                    if ($xmlConfiguration->isMetaLabelingConfiguration()) {
                        $labeledFrameIterator = new Iterator\LabeledFrame(
                            $task,
                            $this->labelingTaskFacade
                        );
                        foreach ($labeledFrameIterator as $labeledFrame) {
                            $row = $metaLabelingColumnGroup->createRow(
                                $project,
                                $video,
                                $task,
                                null,
                                $labeledFrame,
                                $videoCalibration
                            );
                            $metaLabelingTable->addRow($row);
                        }
                    } else {
                        $labeledThingInFramesIterator = new Iterator\LabeledThingInFrame(
                            $this->labeledThingInFrameFacade,
                            $task,
                            $this->ghostClassesPropagation
                        );
                        foreach ($labeledThingInFramesIterator as $labeledThingInFrame) {
                            $row = $objectLabelingColumnGroup->createRow(
                                $project,
                                $video,
                                $task,
                                $labeledThingInFrame,
                                null,
                                $videoCalibration
                            );
                            $objectLabelingTable->addRow($row);
                        }
                    }
                }
                $zipData[$video->getName() . '.csv']      = $objectLabelingTable->toCsv();
                $zipData[$video->getName() . '_meta.csv'] = $metaLabelingTable->toCsv();
            }

            /** @var Model\TaskConfiguration $taskConfiguration */
            foreach ($taskConfigurations as $taskConfiguration) {
                $filename           = sprintf(
                    '%s_%s',
                    $taskConfiguration->getName(),
                    $taskConfiguration->getFilename()
                );
                $zipData[$filename] = $taskConfiguration->getRawData();
            }

            $zipContent = $this->compressData($zipData);

            $date     = new \DateTime('now', new \DateTimeZone('UTC'));
            $filename = sprintf(
                'export_%s.zip',
                $date->format('Y-m-d-H-i-s')
            );

            $export->addAttachment($filename, $zipContent, 'application/zip');
            $export->setStatus(Model\Export::EXPORT_STATUS_DONE);
            $this->exporterFacade->save($export);
        } catch (\Exception $exception) {
            $export->setStatus(Model\Export::EXPORT_STATUS_ERROR);
            $this->exporterFacade->save($export);

            throw $exception;
        }
    }

    /**
     * @param array $data
     *
     * @return string
     * @throws \Exception
     */
    private function compressData(array $data)
    {
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        $zip = new \ZipArchive();
        if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \Exception(sprintf('Unable to open zip archive at "%s"', $zipFilename));
        }

        if (empty($files)) {
            $zip->addEmptyDir('.');
        }
        foreach ($data as $filename => $value) {
            $zip->addFromString($filename, $value);
        }

        $zip->close();

        return file_get_contents($zipFilename);
    }
}
