<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportVideos extends Base
{
    /**
     * @var Service\VideoImporter
     */
    private $videoImporterService;

    /**
     * @var Facade\User
     */
    private $userFacade;

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
     * @param Facade\User           $userFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Service\VideoImporter $videoImporterService,
        Service\TaskCreator $taskCreator,
        Facade\User $userFacade
    ) {
        parent::__construct();
        $this->videoImporterService = $videoImporterService;
        $this->userFacade           = $userFacade;
        $this->projectFacade        = $projectFacade;
        $this->taskCreator          = $taskCreator;
    }

    protected function configure()
    {
        $this->setName('annostation:import:videos')
            ->setDescription('Import a list of videos')
            ->addArgument('directory', Input\InputArgument::REQUIRED, 'Path to the video directory.')
            ->addArgument('project', Input\InputArgument::REQUIRED, 'Project name')
            ->addArgument('type', Input\InputArgument::REQUIRED, 'Pedestrian or vehicle')
            ->addOption(
                'taskConfigurationIdVehicle',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Task ConfigurationId for vehicle instruction'
            )
            ->addOption(
                'taskConfigurationIdPerson',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Task ConfigurationId for person instruction'
            )
            ->addOption(
                'taskConfigurationIdCyclist',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Task ConfigurationId for cyclist instruction'
            )
            ->addOption(
                'taskConfigurationIdIgnore',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Task ConfigurationId for ignore instruction'
            )
            ->addOption(
                'taskConfigurationIdIgnoreVehicle',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Task ConfigurationId for ignore-vehicle instruction'
            )
            ->addOption(
                'taskConfigurationIdLane',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Task ConfigurationId for lane instruction'
            )
            ->addOption('userId', null, Input\InputOption::VALUE_REQUIRED, 'UserId used for importing')
            ->addOption('splitLength', null, Input\InputOption::VALUE_REQUIRED, 'Video split length', 0)
            ->addOption('startFrame', null, Input\InputOption::VALUE_REQUIRED, 'Video start frame', 22)
            ->addOption('frameStepSize', null, Input\InputOption::VALUE_REQUIRED, 'Video frame step size', 22)
            ->addOption(
                'pedestrianMinimalHeight',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Video pedestrian minimal height',
                22
            )
            ->addOption(
                'cuboidMinimalHeight',
                null,
                Input\InputOption::VALUE_REQUIRED,
                'Video cuboid minimal height',
                15
            )
            ->addOption('overflow', null, Input\InputOption::VALUE_REQUIRED, 'Allow video overflow', 16)
            ->addOption('legacyExport', null, Input\InputOption::VALUE_NONE, 'Use the legacy exporter');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $videoDirectory   = $input->getArgument('directory');
        $projectName      = $input->getArgument('project');
        $frameSkip        = $input->getOption('frameStepSize');
        $startFrameNumber = $input->getOption('startFrame');
        $splitEach        = $input->getOption('splitLength');
        $userId           = $input->getOption('userId');
        $user             = $userId === null ? null : $this->userFacade->getUserById($userId);

        $project = Model\Project::create($projectName, null, null, [], $frameSkip, $startFrameNumber, $splitEach);

        $this->addLabelInstructions($project, $input);

        $this->projectFacade->save($project);

        foreach (glob($videoDirectory . '/*.avi') as $videoFile) {
            $this->writeInfo($output, "Uploading video <comment>" . $videoFile . "</comment>");

            $info                = pathinfo($videoFile);
            $calibrationFilePath = null;
            if (is_file($info['dirname'] . '/' . basename($videoFile, '.' . $info['extension']) . '.csv')) {
                $calibrationFilePath = $info['dirname'] . '/' . basename($videoFile, '.' . $info['extension']) . '.csv';
                $this->videoImporterService->importCalibrationData($projectName, $calibrationFilePath);
            }

            $video = $this->videoImporterService->importVideo($project, basename($videoFile), $videoFile, false);
            $tasks = $this->taskCreator->createTasks($project, $video, $user);

            foreach ($tasks as $task) {
                $this->writeInfo(
                    $output,
                    sprintf(
                        'Added New Task: <comment>%s</comment> assigned Video: %s',
                        $task->getId(),
                        $task->getVideoId()
                    )
                );
            }
            $this->writeInfo($output, "---------------------------");
        }
    }

    /**
     * @param Model\Project        $project
     * @param Input\InputInterface $input
     *
     * @throws \Exception
     */
    private function addLabelInstructions(Model\Project $project, Input\InputInterface $input)
    {
        $type                             = $input->getArgument('type');
        $isLegacy                         = $input->getOption('legacyExport');
        $taskConfigurationIdPerson        = $input->getOption('taskConfigurationIdPerson');
        $taskConfigurationIdCyclist       = $input->getOption('taskConfigurationIdCyclist');
        $taskConfigurationIdIgnore        = $input->getOption('taskConfigurationIdIgnore');
        $taskConfigurationIdVehicle       = $input->getOption('taskConfigurationIdVehicle');
        $taskConfigurationIdVehicleIgnore = $input->getOption('taskConfigurationIdIgnoreVehicle');
        $taskConfigurationIdLane          = $input->getOption('taskConfigurationIdLane');
        $taskConfigurationIdParkedCars    = $input->getOption('taskConfigurationIdParkedCars');

        switch ($type) {
            case 'pedestrian':
                $this->addPedestrianInstructions(
                    $project,
                    $isLegacy,
                    $taskConfigurationIdPerson,
                    $taskConfigurationIdCyclist,
                    $taskConfigurationIdIgnore
                );
                break;
            case 'vehicle':
                $this->addVehicleInstructions(
                    $project,
                    $isLegacy,
                    $taskConfigurationIdVehicle,
                    $taskConfigurationIdVehicleIgnore
                );
                break;
            case 'lane':
                $this->addLaneInstructions($project, $isLegacy, $taskConfigurationIdLane);
                break;
            case 'parked-cars':
                $this->addParkedCarsInstructions($project, $isLegacy, $taskConfigurationIdParkedCars);
                break;

            default:
                throw new \Exception('Type' . $type . ' not supported');
        }
    }

    /**
     * @param Model\Project $project
     * @param bool          $isLegacy
     * @param int|null      $taskConfigurationIdPerson
     * @param int|null      $taskConfigurationIdCyclist
     * @param int|null      $taskConfigurationIdIgnore
     *
     * @throws \Exception
     */
    private function addPedestrianInstructions(
        Model\Project $project,
        bool $isLegacy,
        $taskConfigurationIdPerson = null,
        $taskConfigurationIdCyclist = null,
        $taskConfigurationIdIgnore = null
    ) {
        if ($isLegacy) {
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PERSON, 'pedestrian');
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_CYCLIST, 'rectangle');
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_IGNORE, 'rectangle');
        } else {
            if ($taskConfigurationIdPerson === null
                || $taskConfigurationIdCyclist === null
                || $taskConfigurationIdIgnore === null
            ) {
                throw new \Exception('Missing Person, Cyclist or Ignore TaskConfiguration');
            }

            $project->addGenericXmlTaskInstruction(
                Model\LabelingTask::INSTRUCTION_PERSON,
                $taskConfigurationIdPerson
            );
            $project->addGenericXmlTaskInstruction(
                Model\LabelingTask::INSTRUCTION_CYCLIST,
                $taskConfigurationIdCyclist
            );
            $project->addGenericXmlTaskInstruction(
                Model\LabelingTask::INSTRUCTION_IGNORE,
                $taskConfigurationIdIgnore
            );
        }
    }

    /**
     * @param Model\Project $project
     * @param bool          $isLegacy
     * @param string|null      $taskConfigurationIdVehicle
     * @param string|null      $taskConfigurationIdVehicleIgnore
     *
     * @throws \Exception
     */
    private function addVehicleInstructions(
        Model\Project $project,
        bool $isLegacy,
        $taskConfigurationIdVehicle = null,
        $taskConfigurationIdVehicleIgnore = null
    ) {
        if ($isLegacy) {
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_VEHICLE, 'cuboid');
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE, 'rectangle');
        } else {
            if ($taskConfigurationIdVehicle === null || $taskConfigurationIdVehicleIgnore === null) {
                throw new \Exception('Missing Vehicle or IgnoreVehicle TaskConfiguration');
            }

            $project->addGenericXmlTaskInstruction(
                Model\LabelingTask::INSTRUCTION_VEHICLE,
                $taskConfigurationIdVehicle
            );
            $project->addGenericXmlTaskInstruction(
                Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                $taskConfigurationIdVehicleIgnore
            );
        }
    }

    /**
     * @param Model\Project $project
     * @param bool          $isLegacy
     * @param string|null   $taskConfigurationIdLane
     *
     * @throws \Exception
     */
    private function addLaneInstructions(Model\Project $project, bool $isLegacy, $taskConfigurationIdLane = null)
    {
        if ($isLegacy) {
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_LANE, 'rectangle');
        } else {
            if ($taskConfigurationIdLane === null) {
                throw new \Exception('Missing Lane TaskConfiguration');
            }

            $project->addGenericXmlTaskInstruction(
                Model\LabelingTask::INSTRUCTION_LANE,
                $taskConfigurationIdLane
            );
        }
    }

    /**
     * @param Model\Project $project
     * @param bool          $isLegacy
     * @param string|null   $taskConfigurationIdParkedCars
     * @throws \Exception
     *
     */
    private function addParkedCarsInstructions(Model\Project $project, bool $isLegacy, $taskConfigurationIdParkedCars = null)
    {
        if ($isLegacy) {
            $project->addLegacyTaskInstruction(Model\LabelingTask::INSTRUCTION_PARKED_CARS, 'cuboid');
        } else {
            if ($taskConfigurationIdParkedCars === null) {
                throw new \Exception('Missing Parked Cars TaskConfiguration');
            }

            $project->addGenericXmlTaskInstruction(
                Model\LabelingTask::INSTRUCTION_PARKED_CARS,
                $taskConfigurationIdParkedCars
            );
        }
    }
}
