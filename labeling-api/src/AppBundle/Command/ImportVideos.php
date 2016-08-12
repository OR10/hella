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
     * @param Service\VideoImporter $videoImporterService
     * @param Facade\User           $userFacade
     */
    public function __construct(Service\VideoImporter $videoImporterService, Facade\User $userFacade)
    {
        parent::__construct();
        $this->videoImporterService = $videoImporterService;
        $this->userFacade           = $userFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:import:videos')
            ->setDescription('Import a list of videos')
            ->addArgument('directory', Input\InputArgument::REQUIRED, 'Path to the video directory.')
            ->addArgument('project', Input\InputArgument::REQUIRED, 'Project name')
            ->addArgument('type', Input\InputArgument::REQUIRED, 'Pedestrian or vehicle')
            ->addOption('taskConfigurationIdVehicle', null, Input\InputOption::VALUE_REQUIRED, 'Task ConfigurationId for vehicle instruction')
            ->addOption('taskConfigurationIdPerson', null, Input\InputOption::VALUE_REQUIRED, 'Task ConfigurationId for person instruction')
            ->addOption('taskConfigurationIdCyclist', null, Input\InputOption::VALUE_REQUIRED, 'Task ConfigurationId for cyclist instruction')
            ->addOption('taskConfigurationIdIgnore', null, Input\InputOption::VALUE_REQUIRED, 'Task ConfigurationId for ignore instruction')
            ->addOption('taskConfigurationIdIgnoreVehicle', null, Input\InputOption::VALUE_REQUIRED, 'Task ConfigurationId for ignore-vehicle instruction')
            ->addOption('taskConfigurationIdLane', null, Input\InputOption::VALUE_REQUIRED, 'Task ConfigurationId for lane instruction')
            ->addOption('userId', null, Input\InputOption::VALUE_REQUIRED, 'UserId used for importing')
            ->addOption('splitLength', null, Input\InputOption::VALUE_REQUIRED, 'Video split length', 0)
            ->addOption('startFrame', null, Input\InputOption::VALUE_REQUIRED, 'Video start frame', 22)
            ->addOption('frameStepSize', null, Input\InputOption::VALUE_REQUIRED, 'Video frame step size', 22)
            ->addOption('pedestrianMinimalHeight', null, Input\InputOption::VALUE_REQUIRED, 'Video pedestrian minimal height', 22)
            ->addOption('cuboidMinimalHeight', null, Input\InputOption::VALUE_REQUIRED, 'Video cuboid minimal height', 15)
            ->addOption('overflow', null, Input\InputOption::VALUE_REQUIRED, 'Allow video overflow', 16)
            ->addOption('legacyExport', null, Input\InputOption::VALUE_NONE, 'Use the legacy exporter');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $videoDirectory = $input->getArgument('directory');

        foreach (glob($videoDirectory . '/*.avi') as $videoFile) {
            $this->writeInfo(
                $output,
                "Uploading video <comment>" . $videoFile . "</comment>"
            );

            $info           = pathinfo($videoFile);
            $calibrationFilePath = null;
            if (is_file($info['dirname'] . '/' . basename($videoFile, '.' . $info['extension']) . '.csv')) {
                $calibrationFilePath = $info['dirname'] . '/' . basename($videoFile, '.' . $info['extension']) . '.csv';
            }

            $drawingToolOptions = array(
                'pedestrian' => array(
                    'minimalHeight' => $input->getOption('pedestrianMinimalHeight'),
                ),
                'cuboid' => array(
                    'minimalHeight' => $input->getOption('cuboidMinimalHeight'),
                ),
            );

            $user = $input->getOption('userId') === null ? null : $this->userFacade->getUserById($input->getOption('userId'));

            $tasks = $this->videoImporterService->import(
                basename($videoFile),
                $input->getArgument('project'),
                $videoFile,
                $calibrationFilePath,
                false,
                $input->getOption('splitLength'),
                true,
                false,
                $this->getLabelInstructions($input->getArgument('type'), $input),
                $input->getOption('overflow'),
                $drawingToolOptions,
                $input->getOption('frameStepSize'),
                $input->getOption('startFrame'),
                false,
                false,
                $user,
                $input->getOption('legacyExport')
            );

            foreach($tasks as $task) {
                $this->writeInfo(
                    $output,
                    "Added New Task: <comment>" . $task->getId() . "</comment> assigned Video:" .  $task->getVideoId()
                );
            }
            $this->writeInfo($output, "---------------------------");
        }
    }

    private function getLabelInstructions($type, Input\InputInterface $input)
    {
        switch ($type) {
            case 'pedestrian':
                if (!$input->getOption('legacyExport') && (
                        $input->getOption('taskConfigurationIdPerson') === null ||
                        $input->getOption('taskConfigurationIdCyclist') === null ||
                        $input->getOption('taskConfigurationIdIgnore') === null)
                ) {
                    throw new \Exception('Missing Person, Cyclist or Ignore TaskConfiguration');
                }
                return array(
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                        'drawingTool' => 'pedestrian',
                        'taskConfiguration' => $input->getOption('taskConfigurationIdPerson')
                    ),
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_CYCLIST,
                        'drawingTool' => 'rectangle',
                        'taskConfiguration' => $input->getOption('taskConfigurationIdCyclist')
                    ),
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_IGNORE,
                        'drawingTool' => 'rectangle',
                        'taskConfiguration' => $input->getOption('taskConfigurationIdIgnore')
                    ),
                );
            case 'vehicle':
                if (!$input->getOption('legacyExport') && (
                        $input->getOption('taskConfigurationIdVehicle') === null ||
                        $input->getOption('taskConfigurationIdIgnoreVehicle') === null)
                ) {
                    throw new \Exception('Missing Vehicle or IgnoreVehicle TaskConfiguration');
                }
                return array(
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                        'drawingTool' => 'cuboid',
                        'taskConfiguration' => $input->getOption('taskConfigurationIdVehicle')
                    ),
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                        'drawingTool' => 'rectangle',
                        'taskConfiguration' => $input->getOption('taskConfigurationIdIgnoreVehicle')
                    ),
                );
            case 'lane':
                if (!$input->getOption('legacyExport') && $input->getOption('taskConfigurationIdLane') === null) {
                    throw new \Exception('Missing Lane TaskConfiguration');
                }
                return array(
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_LANE,
                        'drawingTool' => 'rectangle',
                        'taskConfiguration' => $input->getOption('taskConfigurationIdLane')
                    ),
                );
        }

        throw new \Exception('Type' . $type . ' not supported');
    }
}