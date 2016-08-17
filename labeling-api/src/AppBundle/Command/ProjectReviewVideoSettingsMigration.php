<?php

namespace AppBundle\Command;

use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;

class ProjectReviewVideoSettingsMigration extends Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        parent::__construct();
        $this->projectFacade      = $projectFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:ProjectReviewVideoSettingsMigration');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $projects = $this->projectFacade->findAll();
        $progress = new ProgressBar($output, count($projects));

        /** @var Model\Project $project */
        foreach ($projects as $project) {
            if ($project->getLabelingValidationProcesses() === null) {
                $project->setLabelingValidationProcesses([]);
            }
            if ($project->getTaskVideoSettings() === null) {
                $tasks = $this->projectFacade->getTasksByProject($project);
                /** @var Model\LabelingTask $firstTask */
                $firstTask = reset($tasks);
                $firstTaskMetadata = $firstTask->getMetaData();
                if ($firstTaskMetadata !== []) {
                    $taskVideoSettings = [
                        'frameSkip' => (int) $firstTaskMetadata['frameSkip'],
                        'startFrameNumber' => (int) $firstTaskMetadata['frameRange']['startFrameNumber'],
                        'splitEach' => 0
                    ];
                    $project->setTaskVideoSettings($taskVideoSettings);
                }
            }
            $this->projectFacade->save($project);
            $progress->advance();
        }
        $progress->finish();
    }
}