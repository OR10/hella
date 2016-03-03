<?php

namespace AppBundle\Service\TaskExporter;

use AppBundle\Database\Facade;
use AppBundle\Model;
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
     * Csv constructor.
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\TaskExport $taskExportFacade
     * @param bool $headline
     * @param string $delimiter
     * @param string $enclosure
     */
    public function __construct(
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\TaskExport $taskExportFacade,
        $headline = true,
        $delimiter = ',',
        $enclosure = '"'
    ) {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->taskExportFacade = $taskExportFacade;
        $this->headline = $headline;
        $this->delimiter = $delimiter;
        $this->enclosure = $enclosure;
    }

    /**
     * Export data for the given task.
     *
     * @param Model\LabelingTask $task
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
     * @return array
     */
    public function getVehicleLabelingData(Model\LabelingTask $task)
    {

        $idCounter = 0;
        return array_map(function ($labeledThingInFrame) use (&$idCounter) {
            $idCounter++;

            $directionBuilder = new Service\TaskExporter\Extractor\RegexBuilder();
            $directionBuilder->setRegexPattern('/^(left|right|front|back)$/');
            $directionBuilder->setGroupName(0);
            $directionRegexExtractor = $directionBuilder->getRegexExtractor();
            $direction = $directionRegexExtractor->extract($labeledThingInFrame);

            $visibleBuilder = new Service\TaskExporter\Extractor\RegexBuilder();
            $visibleBuilder->setRegexPattern('/^(visible-(\d+))$/');
            $visibleBuilder->setGroupName(2);
            $visibleRegexExtractor = $visibleBuilder->getRegexExtractor();
            $visible = $visibleRegexExtractor->extract($labeledThingInFrame);

            return array(
                'id' => $idCounter,
                'frame_number' => $labeledThingInFrame->getFrameNumber(),
                'direction' => $direction,
                'visible' => $visible
            );
        }, $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task));
    }
}