<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportLabelingCsvFile extends Base
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
     * ImportLabelingCsvFile constructor.
     *
     * @param Facade\Project         $projectFacade
     * @param Facade\Video           $videoFacade
     * @param Facade\LabelingTask    $taskFacade
     * @param Service\LabelStructure $labelStructureService
     * @param Service\LabelImporter  $labelImporter
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $taskFacade,
        Service\LabelStructure $labelStructureService,
        Service\LabelImporter $labelImporter
    ) {
        parent::__construct();
        $this->projectFacade         = $projectFacade;
        $this->videoFacade           = $videoFacade;
        $this->taskFacade            = $taskFacade;
        $this->labelStructureService = $labelStructureService;
        $this->labelImporter         = $labelImporter;
    }

    protected function configure()
    {
        $this->setName('annostation:import:csv')
            ->setDescription('Import a csv labeling file for an already imported video')
            ->addArgument('csv', Input\InputArgument::REQUIRED, 'Path to the csv file.')
            ->addOption('video', null, Input\InputOption::VALUE_REQUIRED, 'Name of the imported video file.')
            ->addOption('project', null, Input\InputOption::VALUE_REQUIRED, 'Project Name')
            ->addOption('delimiter', null, Input\InputOption::VALUE_OPTIONAL, 'delimiter charset', ',')
            ->addOption('enclosure', null, Input\InputOption::VALUE_OPTIONAL, 'enclosure charset', '"');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $project   = $this->provideProjectByName($input->getOption('project'));
        $video     = $this->fetchVideoByName($input->getOption('video'));
        $csvFile   = $input->getArgument('csv');
        $delimiter = $input->getOption('delimiter');
        $enclosure = $input->getOption('enclosure');

        $csvData          = $this->loadCsv($csvFile, $delimiter, $enclosure);
        $processedCsvData = $this->convertArrayToHashmap($csvData);

        $uniqueInstructions = $this->extractUniqueInstructions($processedCsvData);

        $tasks = $this->createTasksForInstructions($project, $video, $uniqueInstructions);

        $this->labelImporter->importLabels($tasks, $processedCsvData);
    }

    /**
     * @param Model\Project $project
     * @param Model\Video   $video
     * @param string[]      $instructions
     *
     * @return Model\LabelingTask[]
     */
    protected function createTasksForInstructions(Model\Project $project, Model\Video $video, array $instructions)
    {
        $tasks = array_map(
            function ($instruction) use ($video, $project) {
                $frameNumberMapping = \range(1, $video->getMetaData()->numberOfFrames);

                $task = new Model\LabelingTask(
                    $video,
                    $project,
                    $frameNumberMapping,
                    Model\LabelingTask::TYPE_OBJECT_LABELING,
                    $this->getDrawingToolByInstruction($instruction)
                );

                $task->setLabelStructure(
                    $this->labelStructureService->getLabelStructureForTypeAndInstruction(
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        $instruction
                    )
                );

                $task->setLabelStructureUi(
                    $this->labelStructureService->getLabelStructureUiForTypeAndInstruction(
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        $instruction
                    )
                );

                $this->taskFacade->save($task);
                return $task;
            },
            $instructions
        );
        
        return $tasks;
    }

    /**
     * @param string $instruction
     *
     * @return string
     */
    protected function getDrawingToolByInstruction($instruction)
    {
        switch ($instruction) {
            case Model\LabelingTask::INSTRUCTION_PERSON:
                return 'pedestrian';
                break;
            default:
                return 'rectangle';
        }
    }

    /**
     * Fetch a single video by name
     *
     * @param string $videoName
     *
     * @return Model\Video
     */
    protected function fetchVideoByName($videoName)
    {
        $videos = $this->videoFacade->fetchAllByName($videoName);

        if (count($videos) === 0) {
            throw new \RuntimeException('No video found with name "' . $videoName . '".');
        } else {
            if (count($videos) > 1) {
                throw new \RuntimeException(
                    'More than one (' . count($videos) . ') video with name "' . $videoName . '" found .'
                );
            }
        }

        return $videos[0];
    }

    /**
     * Retrieve or create project by name
     *
     * @param string $projectName
     *
     * @return Model\Project
     */
    protected function provideProjectByName($projectName)
    {
        $project = $this->projectFacade->findByName($input->getOption('projectName'));

        if ($project === null) {
            $project = new Model\Project($projectName);
            $this->projectFacade->save($project);
        }

        return $project;
    }

    /**
     * @param array $rows
     *
     * @return array
     */
    protected function convertArrayToHashmap(array $rows)
    {
        $header = array_shift($rows);

        return array_map(
            function (array $row) use ($header) {
                return array_combine(
                    $header,
                    $row
                );
            },
            $rows
        );
    }

    /**
     * @param string $csvFile
     * @param string $delimiter
     * @param string $enclosure
     *
     * @return array
     */
    protected function loadCsv($csvFile, $delimiter, $enclosure)
    {
        $csvContent = file_get_contents($csvFile);
        $data       = array();

        foreach (
            preg_split(
                "(\r\n|\r|\n)",
                $csvContent,
                -1,
                PREG_SPLIT_NO_EMPTY
            ) as $line
        ) {
            if (empty($line)) {
                continue;
            }
            $data[] = str_getcsv(
                $line,
                $delimiter,
                $enclosure
            );
        }

        return $data;
    }

    /**
     * @param array $processedCsvData
     *
     * @return string[]
     */
    protected function extractUniqueInstructions($processedCsvData)
    {
        $uniqueInstructions = array_unique(
            array_map(
                function ($row) {
                    $instruction = $row['label_class'];
                    if (preg_match('/^(ignore-(\w+))$/', $row['label_class'], $matches)) {
                        $instruction = 'ignore';
                    }

                    return $instruction;
                },
                $processedCsvData
            )
        );

        return $uniqueInstructions;
    }
}