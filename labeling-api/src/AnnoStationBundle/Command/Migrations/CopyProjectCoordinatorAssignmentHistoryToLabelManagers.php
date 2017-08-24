<?php

namespace AnnoStationBundle\Command\Migrations;

use AnnoStationBundle\Command;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console;
use AnnoStationBundle\Worker\Jobs;
use crosscan\WorkerPool;

class CopyProjectCoordinatorAssignmentHistoryToLabelManagers extends Command\Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * TaskDocumentsToTaskDatabase constructor.
     *
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        parent::__construct();
        $this->projectFacade = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrations:copy-project-coordinator-assignment-history-to-label-managers');
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $projects = $this->projectFacade->findAll();
        foreach ($projects as $project) {
            if ($project->getLabelManagerAssignmentHistory() === null) {
                $project->setLabelManagerAssignmentHistory($project->getCoordinatorAssignmentHistory());

                $this->projectFacade->save($project);
                $output->writeln('<info>Updated: ' . $project->getId() . '</info>');
            } else {
                $output->writeln('<error>Skipped: ' . $project->getId() . '</error>');
            }
        }
    }
}
