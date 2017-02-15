<?php

namespace AnnoStationBundle\Command;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service\ProjectDeleter\Delete;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Question;
use Symfony\Component\Console\Style\SymfonyStyle;

class RemoveLabelingTask extends Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Delete\LabelingTasks
     */
    private $labelingTasksDeleter;

    /**
     * @var Delete\LabeledFrames
     */
    private $labeledFramesDeleter;

    /**
     * @var Delete\LabeledThings
     */
    private $labeledThingsDeleter;

    /**
     * @var Delete\LabeledThingInFrames
     */
    private $labeledThingInFrameDeleter;

    /**
     * @var Delete\TaskTimers
     */
    private $taskTimerDeleter;
    
    /**
     * @var Delete\Video
     */
    private $videoDeleter;

    /**
     * RemoveLabelingTask constructor.
     *
     * @param Facade\LabelingTask         $labelingTaskFacade
     * @param Facade\Project              $projectFacade
     * @param Facade\Video                $videoFacade
     * @param Delete\LabelingTasks        $labelingTasksDeleter
     * @param Delete\LabeledFrames        $labeledFramesDeleter
     * @param Delete\LabeledThings        $labeledThingsDeleter
     * @param Delete\LabeledThingInFrames $labeledThingInFrameDeleter
     * @param Delete\TaskTimers           $taskTimerDeleter
     * @param Delete\Video                $videoDeleter
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Delete\LabelingTasks $labelingTasksDeleter,
        Delete\LabeledFrames $labeledFramesDeleter,
        Delete\LabeledThings $labeledThingsDeleter,
        Delete\LabeledThingInFrames $labeledThingInFrameDeleter,
        Delete\TaskTimers $taskTimerDeleter,
        Delete\Video $videoDeleter
    ) {
        parent::__construct();
        $this->labelingTaskFacade         = $labelingTaskFacade;
        $this->projectFacade              = $projectFacade;
        $this->videoFacade                = $videoFacade;
        $this->labelingTasksDeleter       = $labelingTasksDeleter;
        $this->labeledFramesDeleter       = $labeledFramesDeleter;
        $this->labeledThingsDeleter       = $labeledThingsDeleter;
        $this->labeledThingInFrameDeleter = $labeledThingInFrameDeleter;
        $this->taskTimerDeleter           = $taskTimerDeleter;
        $this->videoDeleter               = $videoDeleter;
    }

    protected function configure()
    {
        $this->setName('annostation:RemoveLabelingTask');
        $this->addArgument('taskId', null, 'Labeling Task id to delete');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $io      = new SymfonyStyle($input, $output);
        $taskId  = $input->getArgument('taskId');
        $task    = $this->labelingTaskFacade->find($taskId);
        if ($task === null) {
            $io->error(sprintf('No task found for %s', $taskId));

            return;
        }

        $project = $this->projectFacade->find($task->getProjectId());
        $video   = $this->videoFacade->find($task->getVideoId());

        $io->caution(
            array(
                'This will delete all LabelingTask data like:',
                'labeledFrames, labeledThings, labeledThingInFrames, taskTimers, video (if last one)',
            )
        );

        $helper   = $this->getHelper('question');
        $question = new Question\ConfirmationQuestion(
            sprintf(
                'Are you sure to delete Task "<fg=yellow;options=bold>%s</>" - "<fg=yellow;options=bold>%s</>" from Project "<fg=yellow;options=bold>%s</>"?',
                $video->getName(),
                $task->getLabelInstruction(),
                $project->getName()
            ), false
        );

        if (!$helper->ask($input, $output, $question)) {
            return;
        }

        $this->labeledFramesDeleter->delete($task);
        $io->success('✓ Deleted LabeledFrames');
        $this->labeledThingsDeleter->delete($task);
        $io->success('✓ Deleted LabeledThings');
        $this->labeledThingInFrameDeleter->delete($task);
        $io->success('✓ Deleted LabeledThingInFrame');
        $this->taskTimerDeleter->delete($task);
        $io->success('✓ Deleted TaskTimers');
        $this->videoDeleter->delete($task);
        $io->success('✓ Deleted Video (if last one)');
        $this->labelingTaskFacade->delete($task);
        $io->success('✓ Deleted LabelingTask itself');
    }
}