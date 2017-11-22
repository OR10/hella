<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;

class RebuildProjectDiskUsageFromVideoDocs extends Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade
    ) {
        parent::__construct();
        $this->projectFacade = $projectFacade;
        $this->videoFacade   = $videoFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:rebuild-project-disk-usage-from-video-docs')
            ->setDescription('Re-calculate the project disk usage from the video documents')
            ->addArgument(
                'projectId',
                Input\InputArgument::OPTIONAL,
                'Rebuild a single project only.'
            )
            ->addOption('dryrun');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $dryrun = $input->getOption('dryrun');
        $projectId = $input->getArgument('projectId');
        if ($projectId === null) {
            $projects = $this->projectFacade->findAll();
        } else {
            $projects = [$this->projectFacade->find($projectId)];
        }

        /** @var Model\Project $project */
        $diffSize = 0;
        foreach ($projects as $project) {
            $oldSize = $project->getDiskUsageInBytes();
            $newSize = $this->videoFacade->calculateAggregatedeVideoSizeForProject($project);
            if ($oldSize !== $newSize) {
                $diffSize = $diffSize - ($oldSize - $newSize);
                $output->writeln(
                    sprintf(
                        '[<fg=red>INVALID</>] size for Project "<fg=white;options=bold>%s</>" <fg=red>%s MB</> --> <fg=green>%s MB</>',
                        $project->getName(),
                        round(($oldSize / 1024) / 1024),
                        round(($newSize / 1024) / 1024)
                    )
                );
                if (!$dryrun) {
                    $project->setDiskUsageInBytes($newSize);
                    $this->projectFacade->save($project);
                }
            } else {
                $output->writeln(
                    sprintf(
                        '[<fg=green>OK</>] size for Project "%s" <fg=green>%s MB</>',
                        $project->getName(),
                        round(($newSize / 1024) / 1024)
                    )
                );
            }
        }
        $output->writeln('<fg=white;options=bold>#####################################</>');
        $output->writeln(
            sprintf(
                '[<fg=green>DONE</>] Overall fixed diff <fg=red;options=bold>%s MB</>',
                round(($diffSize / 1024) / 1024)
            )
        );
    }
}