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
            ->addOption('taskConfigurationId', null, Input\InputOption::VALUE_REQUIRED, 'Task ConfigurationID (userId is required)')
            ->addOption('userId', null, Input\InputOption::VALUE_REQUIRED, 'UserId used for importing')
            ->addOption('splitLength', null, Input\InputOption::VALUE_REQUIRED, 'Video split length', 0)
            ->addOption('startFrame', null, Input\InputOption::VALUE_REQUIRED, 'Video start frame', 22)
            ->addOption('frameStepSize', null, Input\InputOption::VALUE_REQUIRED, 'Video frame step size', 22)
            ->addOption('pedestrianMinimalHeight', null, Input\InputOption::VALUE_REQUIRED, 'Video pedestrian minimal height', 22)
            ->addOption('cuboidMinimalHeight', null, Input\InputOption::VALUE_REQUIRED, 'Video cuboid minimal height', 15)
            ->addOption('overflow', null, Input\InputOption::VALUE_REQUIRED, 'Allow video overflow', 16);
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
                $this->getLabelInstructions($input->getArgument('type')),
                $input->getOption('overflow'),
                $drawingToolOptions,
                $input->getOption('frameStepSize'),
                $input->getOption('startFrame'),
                false,
                false,
                $input->getOption('taskConfigurationId'),
                $user
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

    private function getLabelInstructions($type)
    {
        switch ($type) {
            case 'pedestrian':
                return array(
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                        'drawingTool' => 'pedestrian',
                    ),
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_CYCLIST,
                        'drawingTool' => 'rectangle',
                    ),
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_IGNORE,
                        'drawingTool' => 'rectangle',
                    ),
                );
            case 'vehicle':
                return array(
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_VEHICLE,
                        'drawingTool' => 'cuboid',
                    ),
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                        'drawingTool' => 'rectangle',
                    ),
                );
            case 'lane':
                return array(
                    array(
                        'instruction' => Model\LabelingTask::INSTRUCTION_LANE,
                        'drawingTool' => 'rectangle',
                    ),
                );
        }

        throw new \Exception('Type' . $type . ' not supported');
    }
}