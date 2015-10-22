<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
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
     * @var Service\Video\MetaDataReader
     */
    private $metaDataReader;

    /**
     * ImportVideoCommand constructor.
     *
     * @param Facade\Video $videoFacade
     * @param Service\Video\MetaDataReader $metaDataReader
     */
    public function __construct(
        Facade\Video $videoFacade,
        Service\Video\MetaDataReader $metaDataReader
    ) {
        parent::__construct();
        $this->videoFacade    = $videoFacade;
        $this->metaDataReader = $metaDataReader;
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
            $video = new Model\Video(basename($filename));
            $video->setMetaData($this->metaDataReader->readMetaData($filename));
            $this->videoFacade->save($video, $filename);
            $output->writeln("<info>{$filename} successfully imported!</info>");
        }
        catch (\Exception $e) {
            $output->writeln("<error>Error importing {$filename}: {$e->getMessage()}</error>");
        }
    }
}
