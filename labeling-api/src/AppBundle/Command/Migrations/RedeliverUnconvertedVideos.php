<?php

namespace AppBundle\Command\Migrations;

use AppBundle\Model;
use AppBundle\Database\Facade;
use AppBundle\Service;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;
use AppBundle\Model\Video\ImageType;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool;
use AppBundle\Command;

class RedeliverUnconvertedVideos extends Command\Base
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var WorkerPool\Facade
     */
    private $facadeAMQP;

    /**
     * @param Facade\Video      $videoFacade
     * @param WorkerPool\Facade $facadeAMQP
     */
    public function __construct(
        Facade\Video $videoFacade,
        WorkerPool\Facade $facadeAMQP
    ) {
        parent::__construct();
        $this->videoFacade = $videoFacade;
        $this->facadeAMQP  = $facadeAMQP;
    }

    protected function configure()
    {
        $this->setName('annostation:RedeliverUnconvertedVideos')
            ->setDescription('Redeliver all unconverted video jobs');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $videos = $this->videoFacade->getAllUnconvertedVideos();

        $redeliveredJobs = [];

        foreach ($videos as $video) {
            if (array_key_exists($video->getId(), $redeliveredJobs)) {
                continue;
            }

            foreach ($video->getImageTypes() as $imageType => $status) {
                $job = new Jobs\VideoFrameSplitter(
                    $video->getId(),
                    $video->getSourceVideoPath(),
                    ImageType\Base::create($imageType)
                );
                $this->facadeAMQP->addJob($job, WorkerPool\Facade::LOW_PRIO);
            }

            $redeliveredJobs[$video->getId()] = $video;
        }
    }
}