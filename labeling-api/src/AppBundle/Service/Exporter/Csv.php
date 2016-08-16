<?php
namespace AppBundle\Service\Exporter;

use AppBundle\Model;
use AppBundle\Helper\Iterator;
use AppBundle\Database\Facade;
use AppBundle\Helper\Export;
use AppBundle\Helper\Export\Column;
use AppBundle\Service;
use AppBundle\Helper\Export\ColumnGroup;

class Csv
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
        Service\GhostClassesPropagation $ghostClassesPropagation
    )
    {
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
    }

    /**
     * @param Model\Project $project
     */
    public function export(Model\Project $project)
    {
        $csvFileData = array();
        $videoIterator = new Iterator\Video($this->projectFacade, $this->videoFacade, $project);
        foreach ($videoIterator as $video) {
            /** @var ColumnGroup\Unique $columnGroup */
            $columnGroup = $this->columnGroupFactory->create(Service\ColumnGroupFactory::UNIQUE);
            $columnGroup->addColumns([
                new Column\Uuid(),
                new Column\FrameNumber(),
            ]);

            // generate columns for this Video
            $labelingTaskIterator = new Iterator\LabelingTask($this->labelingTaskFacade, $video);
            /** @var Model\LabelingTask $task */
            foreach ($labelingTaskIterator as $task) {
                $columnGroup->addColumns($this->shapeColumnsFactory->create($task->getDrawingTool()));

                $xmlConfiguration = $this->taskConfiguration->find($task->getTaskConfigurationId());
                $configurationXmlConverterFactory = $this->configurationXmlConverterFactory->createConverter($xmlConfiguration->getRawData());
                $columnGroup->addColumns(
                    $this->classColumnsFactory->create($configurationXmlConverterFactory->getClassStructure())
                );
            }

            $table = new Export\Table($columnGroup);
            foreach ($labelingTaskIterator as $task) {
                $labeledThingInFramesIterator = new Iterator\LabeledThingInFrame(
                    $this->labeledThingInFrameFacade,
                    $task,
                    $this->ghostClassesPropagation
                );
                foreach ($labeledThingInFramesIterator as $labeledThingInFrame) {
                    $row = $columnGroup->createRow($project, $video, $task, $labeledThingInFrame);
                    $table->addRow($row);
                }
            }
            $csvFileData[$video->getName()] = $table->toCsv();
        }

        $zipContent = $this->compressData($csvFileData);

        $date     = new \DateTime('now', new \DateTimeZone('UTC'));
        $filename = sprintf(
            'export_%s.zip',
            $date->format('Y-m-d-H-i-s')
        );

        $export = new Model\Export($project, $filename, $zipContent, 'application/zip');
        $this->exporterFacade->save($export);

    }

    /**
     * @param array $data
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
            $zip->addFromString($filename . '.csv', $value);
        }

        $zip->close();

        return file_get_contents($zipFilename);
    }
}