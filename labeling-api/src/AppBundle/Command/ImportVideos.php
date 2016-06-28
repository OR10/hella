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
     * @param Service\VideoImporter $videoImporterService
     */
    public function __construct(Service\VideoImporter $videoImporterService)
    {
        parent::__construct();
        $this->videoImporterService = $videoImporterService;
    }

    protected function configure()
    {
        $this->setName('annostation:import:videos')
            ->setDescription('Import a list of videos')
            ->addArgument('directory', Input\InputArgument::REQUIRED, 'Path to the video directory.')
            ->addArgument('project', Input\InputArgument::REQUIRED, 'Project name')
            ->addArgument('type', Input\InputArgument::REQUIRED, 'Pedestrian or vehicle')
            ->addArgument('splitLength', Input\InputArgument::OPTIONAL, 'Video split length', 0)
            ->addArgument('startFrame', Input\InputArgument::OPTIONAL, 'Video start frame', 22)
            ->addArgument('frameStepSize', Input\InputArgument::OPTIONAL, 'Video frame step size', 22)
            ->addArgument('pedestrianMinimalHeight', Input\InputArgument::OPTIONAL, 'Video pedestrian minimal height', 22)
            ->addArgument('overflow', Input\InputArgument::OPTIONAL, 'Allow video overflow', 16);
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
                    'minimalHeight' => $input->getArgument('pedestrianMinimalHeight'),
                ),
            );

            $tasks = $this->videoImporterService->import(
                basename($videoFile),
                $input->getArgument('project'),
                $videoFile,
                $calibrationFilePath,
                false,
                $input->getArgument('splitLength'),
                true,
                false,
                $this->getLabelInstructions($input->getArgument('type')),
                $input->getArgument('overflow'),
                $drawingToolOptions,
                $input->getArgument('frameStepSize'),
                $input->getArgument('startFrame')
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
        }

        throw new \Exception('Type' . $type . ' not supported');
    }
}