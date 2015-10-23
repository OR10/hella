<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Bundle\FrameworkBundle\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use AppBundle\Model\Video\ImageType;

class ImportVideoCommand extends Command\ContainerAwareCommand
{

    /**
     * @var Service\ImporterService
     */
    private $importerService;

    public function __construct(
        Service\ImporterService $importerService
    ) {
        parent::__construct();
        $this->importerService = $importerService;
    }

    protected function configure()
    {
        $this->setName('annostation:import:video')
            ->setDescription('Import a video from a filename')
            ->addArgument('file', Input\InputArgument::REQUIRED, 'Path to the video file.');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $filename = $input->getArgument('file');

        try {
            $task = $this->importerService->import($filename, ImageType\Base::create('source'));
            $output->writeln("<info>{$filename} successfully imported!</info>");
            $output->writeln("Video: {$task->getVideoId()}");
            $output->writeln("Task:  {$task->getId()}");
        } catch (\Exception $e) {
            $output->writeln("<error>Error importing {$filename}: {$e->getMessage()}</error>");
        }
    }
}
