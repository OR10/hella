<?php

namespace AnnoStationBundle\Service\LabelImporter;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\LabelImporter\Parser;
use AnnoStationBundle\Service\LabelImporter\DataSource;

class SimpleXml
{
    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @var Importer\SimpleXml2d
     */
    private $simpleXml2dImporter;

    /**
     * @var Importer\SimpleXml3d
     */
    private $simpleXml3dImporter;

    public function __construct(
        Facade\LabelingTask $taskFacade,
        Service\LabelImporter\Importer\SimpleXml2d $simpleXml2dImporter,
        Service\LabelImporter\Importer\SimpleXml3d $simpleXml3dImporter
    ) {
        $this->taskFacade          = $taskFacade;
        $this->simpleXml2dImporter = $simpleXml2dImporter;
        $this->simpleXml3dImporter = $simpleXml3dImporter;
    }

    public function import($taskId, $file, $delimiter, $enclosure)
    {
        $task = $this->taskFacade->find($taskId);

        $parser = new Parser\Csv(
            new DataSource\File(
                new \SplFileObject(
                    $file
                )
            )
        );
        $parser->setFirstLineIsHeader(true);
        $parser->setDelimiter($delimiter);
        $parser->setEnclosure($enclosure);

        switch ($task->getDrawingTool()) {
            case Model\LabelingTask::DRAWING_TOOL_RECTANGLE:
            case Model\LabelingTask::DRAWING_TOOL_PEDESTRIAN:
                $this->simpleXml2dImporter->import($parser, $task);
                break;
            case Model\LabelingTask::DRAWING_TOOL_CUBOID:
                $this->simpleXml3dImporter->import($parser, $task);
                break;
        }
    }
}
