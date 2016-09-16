<?php

namespace AppBundle\Command\Migrations;

use AppBundle\Command;
use AppBundle\Database\Facade;
use AppBundle\Model;
use Symfony\Component\Console;

class SetMissingLabelInstructionsInProjects extends Command\Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @param Facade\Project      $projectFacade
     * @param Facade\LabelingTask $taskFacade
     */
    public function __construct(Facade\Project $projectFacade, Facade\LabelingTask $taskFacade)
    {
        parent::__construct();
        $this->projectFacade = $projectFacade;
        $this->taskFacade    = $taskFacade;
    }

    protected function configure()
    {
        $this->setName('annostation:migrate:set-missing-label-instructions-in-projects');
        $this->addOption('dry-run', null, Console\Input\InputOption::VALUE_NONE, "Don't actually change anything.");
    }

    protected function execute(Console\Input\InputInterface $input, Console\Output\OutputInterface $output)
    {
        $this->writeSection($output, 'Set missing label instructions in projects');

        /** @var Model\Project[] $projects */
        $projects = $this->projectFacade->findAll()->toArray();
        $dryRun   = $input->getOption('dry-run');

        if ($dryRun) {
            $this->writeInfo($output, 'dry run');
        }

        foreach ($projects as $project) {
            if (!empty($project->getGenericXmlTaskInstructions())) {
                continue;
            }

            /** @var Model\LabelingTask[] $tasks */
            $tasks = $this->taskFacade->findAllByProject($project);

            $projectChanged = false;
            foreach ($tasks as $task) {
                if ($this->containsTaskInstruction($project, $task)) {
                    continue;
                }

                $this->writeInfo(
                    $output,
                    sprintf('%s: %s - %s', $project->getName(), $task->getLabelInstruction(), $task->getDrawingTool())
                );

                if (!$dryRun) {
                    $project->addLegacyTaskInstruction($task->getLabelInstruction(), $task->getDrawingTool());
                    $projectChanged = true;
                }
            }

            if ($projectChanged) {
                $this->projectFacade->save($project);
            }
        }
    }

    /**
     * @param Model\Project      $project
     * @param Model\LabelingTask $task
     *
     * @return bool
     */
    protected function containsTaskInstruction(Model\Project $project, Model\LabelingTask $task)
    {
        foreach ($project->getLegacyTaskInstructions() as $instruction) {
            if ($instruction['instruction'] === $task->getLabelInstruction()) {
                if ($instruction['drawingTool'] === $task->getDrawingTool()) {
                    return true;
                }
            }
        }

        return false;
    }
}