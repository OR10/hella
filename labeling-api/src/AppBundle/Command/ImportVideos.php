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
            ->addArgument('splitLength', Input\InputArgument::OPTIONAL, 'Video split length', 0)
            ->addArgument('startFrame', Input\InputArgument::OPTIONAL, 'Video start frame', 1)
            ->addArgument('frameStepSize', Input\InputArgument::OPTIONAL, 'Video frame step size', 1)
            ->addArgument('drawingToolPerson', Input\InputArgument::OPTIONAL, 'Video person drawing tool', 'pedestrian')
            ->addArgument('drawingToolCyclist', Input\InputArgument::OPTIONAL, 'Video cyclist drawing tool', 'rectangle')
            ->addArgument('drawingToolIgnore', Input\InputArgument::OPTIONAL, 'Video ignore drawing tool', 'rectangle')
            ->addArgument('pedestrianMinimalHeight', Input\InputArgument::OPTIONAL, 'Video pedestrian minimal height', 22)
            ->addArgument('overflow', Input\InputArgument::OPTIONAL, 'Allow video overflow', 16);
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $videoDirectory = $input->getArgument('directory');

        foreach (glob($videoDirectory . '/*.mp4') as $videoFile) {
            $this->writeInfo(
                $output,
                "Uploading video <comment>" . $videoFile . "</comment>"
            );

            $info           = pathinfo($videoFile);
            $calibrationFilePath = null;
            if (is_file($info['dirname'] . '/' . basename($videoFile, '.' . $info['extension']) . '_calib.csv')) {
                $calibrationFilePath = $info['dirname'] . '/' . basename($videoFile, '.' . $info['extension']) . '_calib.csv';
            }

            //Label instructions
            $labelInstructions = array(
                array(
                    'instruction' => Model\LabelingTask::INSTRUCTION_PERSON,
                    'drawingTool' => $input->getArgument('drawingToolPerson'),
                ),
                array(
                    'instruction' => Model\LabelingTask::INSTRUCTION_CYCLIST,
                    'drawingTool' => $input->getArgument('drawingToolCyclist'),
                ),
                array(
                    'instruction' => Model\LabelingTask::INSTRUCTION_IGNORE,
                    'drawingTool' => $input->getArgument('drawingToolIgnore'),
                ),
            );

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
                $labelInstructions,
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
}