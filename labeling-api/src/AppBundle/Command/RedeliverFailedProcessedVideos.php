<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;
use AppBundle\Model\Video\ImageType;
use AppBundle\Worker\Jobs;
use crosscan\WorkerPool;

class RedeliverFailedProcessedVideos extends Base
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
     * @param WorkerPool\Facade $workerPoolFacade
     */
    public function __construct(
        Facade\Video $videoFacade,
        WorkerPool\Facade $workerPoolFacade
    ) {
        parent::__construct();
        $this->videoFacade = $videoFacade;
        $this->facadeAMQP  = $workerPoolFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:RedeliverFailedProcessedVideos')
            ->setDescription('Redeliver all failed video jobs');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $videos = $this->videoFacade->getAllFailedPreprocessingVideos();

        $redeliveredJobs = [];

        foreach ($videos as $video) {
            if (array_key_exists($video->getId(), $redeliveredJobs)) {
                continue;
            }

            foreach ($video->getImageTypes() as $imageType => $status) {
                if (array_key_exists('failed', $status) && $status['failed']) {
                    $job = new Jobs\VideoFrameSplitter(
                        $video->getId(),
                        $video->getSourceVideoPath(),
                        ImageType\Base::create($imageType)
                    );
                    $this->facadeAMQP->addJob($job, WorkerPool\Facade::LOW_PRIO);
                }
            }

            $redeliveredJobs[$video->getId()] = $video;
        }
    }
}
