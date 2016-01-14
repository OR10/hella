<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportVideo extends Base
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
        $this->setName('annostation:import:video')
            ->setDescription('Import a video from a filename')
            ->addArgument('file', Input\InputArgument::REQUIRED, 'Path to the video file.')
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
            $stream    = fopen($filename, 'r+');
            $videoName = basename($filename);
            $tasks     = $this->videoImporterService->import(
                $videoName,
                $filename,
                $input->getOption('lossless'),
                $input->getOption('chunk-size')
            );

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
