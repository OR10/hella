<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Bundle\FrameworkBundle\Command;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class ImportVideoCommand extends Command\ContainerAwareCommand
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * ImportVideoCommand constructor.
     *
     * @param Facade\Video $videoFacade
     */
    public function __construct(Facade\Video $videoFacade)
    {
        parent::__construct();
        $this->videoFacade = $videoFacade;
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
            $this->videoFacade->save(new Model\Video(basename($filename)), $filename);
            $output->writeln("<info>{$filename} successfully imported!</info>");
        }
        catch (\Exception $e) {
            $output->writeln("<error>Error importing {$filename}: {$e->getMessage()}</error>");
        }
    }
}
