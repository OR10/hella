<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AnnoStationBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportVideo extends Base
{
    /**
     * @var Service\VideoImporter
     */
    private $videoImporterService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Service\TaskCreator
     */
    private $taskCreator;

    /**
     * @param Facade\Project        $projectFacade
     * @param Service\VideoImporter $videoImporterService
     * @param Service\TaskCreator   $taskCreator
     */
    public function __construct(
        Facade\Project $projectFacade,
        Service\VideoImporter $videoImporterService,
        Service\TaskCreator $taskCreator
    ) {
        parent::__construct();
        $this->videoImporterService = $videoImporterService;
        $this->projectFacade        = $projectFacade;
        $this->taskCreator          = $taskCreator;
    }

    protected function configure()
    {
        $this->setName('annostation:import:video')
            ->setDescription('Import a video from a filename')
            ->addArgument('file', Input\InputArgument::REQUIRED, 'Path to the video file.')
            ->addArgument('projectName', Input\InputArgument::REQUIRED, 'Project Name')
            ->addOption(
                'chunk-size',
                0,
                Input\InputOption::VALUE_OPTIONAL,
                "Create tasks for each <chunk-size> seconds of the video (0 = don't split)."
            )
            ->addOption(
                'lossless',
                null,
                Input\InputOption::VALUE_NONE,
                'Generate lossless compressed PNGs instead of JPGs.'
            );
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $filename = $input->getArgument('file');

        $this->writeSection($output, "Importing video from file <comment>{$filename}</>");

        try {
            $info                = pathinfo($filename);
            $videoName           = basename($filename);
            $basename            = basename($filename, '.' . $info['extension']);
            $calibrationFilePath = sprintf('%s/%s_calib.csv', $info['dirname'], $basename);

            if (!is_file($calibrationFilePath)) {
                $calibrationFilePath = null;
            }

            $projectName = $input->getArgument('projectName');
            $project     = $this->projectFacade->findByName($projectName);
            if ($project === null) {
                $project = Model\Project::create($projectName, null, null, null, [], 1, 1, 0);

                $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PERSON, 'pedestrian');

                $this->projectFacade->save($project);
            }

            $video = $this->videoImporterService->importVideo(
                $project,
                $videoName,
                $filename,
                $input->getOption('lossless')
            );

            if ($calibrationFilePath !== null) {
                $this->videoImporterService->importCalibrationData($project, $calibrationFilePath);
            }

            $tasks = $this->taskCreator->createTasks($project, $video);

            if (count($tasks) > 0) {
                $this->writeInfo($output, "VideoId: <comment>{$tasks[0]->getVideoId()}</>");
            }

            foreach ($tasks as $task) {
                $this->writeInfo($output, "Task type: <comment> {$task->getTaskType()}</>");
                $this->writeInfo($output, "TaskId:  <comment>{$task->getId()}</>");
            }

            $this->writeInfo($output, "<info>Video successfully imported!</info>");
        } catch (\Exception $e) {
            $this->writeError($output, "Error importing {$filename}: {$e->getMessage()}");
        }
    }
}
