<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Doctrine\ORM;
use Doctrine\ODM\CouchDB;
use Symfony\Component\Console\Helper\ProgressBar;
use AppBundle\Model\Video\ImageType;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool;

class ReprocessVideos extends Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var WorkerPool\Facade
     */
    private $workerPoolFacade;

    /**
     * @param Facade\Video      $videoFacade
     * @param WorkerPool\Facade $workerPoolFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        WorkerPool\Facade $workerPoolFacade
    ) {
        parent::__construct();
        $this->projectFacade    = $projectFacade;
        $this->videoFacade      = $videoFacade;
        $this->workerPoolFacade = $workerPoolFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:ReprocessVideos')
            ->setDescription('Convert video(s) of a project again, reuploading all frames again.')
            ->addArgument(
                'projectId',
                Input\InputArgument::REQUIRED,
                'Id of the project to reprocess'
            )
            ->addArgument(
                'videoId',
                Input\InputArgument::OPTIONAL,
                'Id of the video to re process. If not videoId is given all videos of the project will be reprocessed.',
                null
            );
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $projectId = $input->getArgument('projectId');
        $videoId   = $input->getArgument('videoId');

        $project = $this->getProjectById($output, $projectId);

        $output->writeln('Fetching video information');
        if ($videoId) {
            $videoIds = [$videoId];
        } else {
            $videoIds = $project->getVideoIds();
        }

        $videos = $this->getVideosForVideoIds($videoIds);

        foreach ($videos as $video) {
            $this->addJobsForVideo($output, $video);
        }

        $output->writeln("Project {$projectId} and {count($videos)} number of videos.");
    }

    private function getProjectById(Output\OutputInterface $output, string $id): Model\Project
    {
        $output->writeln("Fetching project with id {$id}");
        $project = $this->projectFacade->find($id);

        return $project;
    }

    private function getVideosForVideoIds(array $ids): array
    {
        $videos = array_map(
            function ($videoId) {
                return $this->videoFacade->find($videoId);
            },
            $ids
        );

        return $videos;
    }

    private function addJobsForVideo(Output\OutputInterface $output, Model\Video $video): void
    {
        foreach($video->getImageTypes() as $imageTypeName => $imageType) {
            $output->writeln("Adding job for video {$video->getId()} and imagetype {$imageTypeName}");
            $job = new Jobs\VideoFrameSplitter(
                $video->getId(),
                $video->getSourceVideoPath(),
                ImageType\Base::create($imageTypeName)
            );

            $this->workerPoolFacade->addJob(
                $job,
                WorkerPool\Facade::LOW_PRIO
            );
        }
    }
}
