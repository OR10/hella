<?php

namespace AnnoStationBundle\Command;

use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GetVideoFromCDN extends Base
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Service\VideoCdn
     */
    private $videoCdnService;

    /**
     * GetVideoFromCDN constructor.
     *
     * @param Facade\Video     $videoFacade
     * @param Service\VideoCdn $videoCdnService
     */
    public function __construct(Facade\Video $videoFacade, Service\VideoCdn $videoCdnService)
    {
        parent::__construct();

        $this->videoFacade     = $videoFacade;
        $this->videoCdnService = $videoCdnService;
    }

    protected function configure()
    {
        $this->setName('annostation:get-video-from-cdn')
            ->setDescription('Downloads the video file for a given video id to this machine')
            ->addOption(
                'video-id',
                'i',
                InputOption::VALUE_REQUIRED,
                'The video id',
                null
            )
            ->addOption(
                'output',
                'o',
                InputOption::VALUE_REQUIRED,
                'The output path',
                null
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $video = $this->videoFacade->find($input->getOption('video-id'));

        if ($video === null) {
            throw new \RuntimeException("Video could not be found");
        }

        $outputPath = $input->getOption('output');
        if (file_put_contents($outputPath, $this->videoCdnService->getVideo($video)) === false) {
            throw new \RuntimeException("Error writing video data to temporary file '{$outputPath}'");
        }
    }
}
