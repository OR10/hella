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
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Service\Video\MetaDataReader
     */
    private $metaDataReader;
    /**
     * @var Service\Video\VideoFrameSplitter
     */
    private $frameCdnSplitter;

    /**
     * ImportVideoCommand constructor.
     *
     * @param Facade\Video $videoFacade
     * @param Service\Video\MetaDataReader $metaDataReader
     */
    public function __construct(
        Facade\Video $videoFacade,
        Service\Video\MetaDataReader $metaDataReader,
        Service\Video\VideoFrameSplitter $frameCdnSplitter
    ) {
        parent::__construct();
        $this->videoFacade    = $videoFacade;
        $this->metaDataReader = $metaDataReader;
        $this->frameCdnSplitter = $frameCdnSplitter;
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
            $this->frameCdnSplitter->splitVideoInFrames($video, $filename, ImageType\Base::create('source'));
            $output->writeln("<info>{$filename} successfully imported!</info>");
        }
        catch (\Exception $e) {
            $output->writeln("<error>Error importing {$filename}: {$e->getMessage()}</error>");
        }
    }
}
