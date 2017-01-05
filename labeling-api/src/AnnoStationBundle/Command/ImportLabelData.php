<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\LabelImporter;
use AnnoStationBundle\Service\LabelImporter\Parser;
use AnnoStationBundle\Service\LabelImporter\DataSource;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportLabelData extends Base
{
    /**
     * @var Facade\Project
     */
    protected $projectFacade;

    /**
     * @var Facade\Video
     */
    protected $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    protected $taskFacade;

    /**
     * @var Service\LabelStructure
     */
    protected $labelStructureService;

    /**
     * @var Service\LabelImporter
     */
    protected $labelImporter;
    /**
     * @var LabelImporter\Importer\SimpleXml2d
     */
    private $simpleXml2dImporter;

    /**
     * @var LabelImporter\Importer\SimpleXml3d
     */
    private $simpleXml3dImporter;

    /**
     * ImportLabelData constructor.
     *
     * @param Facade\Project                     $projectFacade
     * @param Facade\Video                       $videoFacade
     * @param Facade\LabelingTask                $taskFacade
     * @param Service\LabelStructure             $labelStructureService
     * @param LabelImporter\Importer\SimpleXml2d $simpleXml2dImporter
     * @param LabelImporter\Importer\SimpleXml3d $simpleXml3dImporter
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $taskFacade,
        Service\LabelStructure $labelStructureService,
        Service\LabelImporter\Importer\SimpleXml2d $simpleXml2dImporter,
        Service\LabelImporter\Importer\SimpleXml3d $simpleXml3dImporter
    ) {
        parent::__construct();
        $this->projectFacade         = $projectFacade;
        $this->videoFacade           = $videoFacade;
        $this->taskFacade            = $taskFacade;
        $this->labelStructureService = $labelStructureService;
        $this->simpleXml2dImporter   = $simpleXml2dImporter;
        $this->simpleXml3dImporter   = $simpleXml3dImporter;
    }

    protected function configure()
    {
        $this->setName('annostation:import:labelData')
            ->setDescription('Import a csv labeling file for an already imported video')
            ->addArgument('file', Input\InputArgument::REQUIRED, 'Path to the file.')
            ->addOption('taskId', null, Input\InputOption::VALUE_REQUIRED, 'task ID')
            ->addOption('delimiter', null, Input\InputOption::VALUE_OPTIONAL, 'delimiter charset', ',')
            ->addOption('enclosure', null, Input\InputOption::VALUE_OPTIONAL, 'enclosure charset', '"');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $task = $this->taskFacade->find($input->getOption('taskId'));

        $parser = new Parser\Csv(
            new DataSource\File(
                new \SplFileObject(
                    $input->getArgument('file')
                )
            )
        );
        $parser->setFirstLineIsHeader(true);
        $parser->setDelimiter($input->getOption('delimiter'));
        $parser->setEnclosure($input->getOption('enclosure'));

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
