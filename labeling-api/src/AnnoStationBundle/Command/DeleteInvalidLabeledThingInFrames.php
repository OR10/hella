<?php

namespace AnnoStationBundle\Command;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Input\InputArgument;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;

class DeleteInvalidLabeledThingInFrames extends Base
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var LabeledThing\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    /**
     * @var LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledThing\FacadeInterface $labeledThingFacadeFactory,
        LabeledThingInFrame\FacadeInterface $labeledThingInFrameFacadeFactory

    ) {
        parent::__construct();
        $this->labelingTaskFacade               = $labelingTaskFacade;
        $this->labeledThingInFrameFacadeFactory = $labeledThingInFrameFacadeFactory;
        $this->labeledThingFacadeFactory        = $labeledThingFacadeFactory;
    }

    protected function configure()
    {
        $this->setName('annostation:delete-invalid-labeledThingInFrames')
            ->setDescription('Delete all LTIF with an invalid LT reference')
            ->addArgument('logFilePath', InputArgument::REQUIRED)
            ->addOption('dryRun');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $dryRun      = $input->getOption('dryRun');
        $logFilePath = $input->getArgument('logFilePath');
        $deletedDocs = 0;
        $tasks       = $this->labelingTaskFacade->findAll();
        $progressBar = new ProgressBar($output, count($tasks));
        $progressBar->setFormatDefinition(
            'custom',
            ' Scanning Task %current% of %max% Tasks -- [Deleted Documents: %deletedDocs%] '
        );
        $progressBar->setFormat('custom');
        $progressBar->setMessage($deletedDocs, 'deletedDocs');
        foreach ($tasks as $task) {
            $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $task->getProjectId(),
                $task->getId()
            );

            $labeledThingsInFrames        = $labeledThingInFrameFacade->getLabeledThingsInFrame($task);
            $invalidLabeledThingsInFrames = $this->getInvalidLabeledThingReferencesFromLabeledThingInFrames(
                $labeledThingsInFrames,
                $task->getProjectId(),
                $task->getId()
            );

            $this->deleteLabeledThingInFrames(
                $invalidLabeledThingsInFrames,
                $task->getFrameNumberMapping(),
                $dryRun,
                $logFilePath
            );
            $deletedDocs += count($invalidLabeledThingsInFrames);
            $progressBar->setMessage($deletedDocs, 'deletedDocs');
            $progressBar->advance();
        }
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrames
     * @param                             $projectId
     * @param                             $taskId
     *
     * @return array
     */
    private function getInvalidLabeledThingReferencesFromLabeledThingInFrames(
        $labeledThingsInFrames,
        $projectId,
        $taskId
    ) {
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $projectId,
            $taskId
        );

        $invalidLabeledThingInFrames = [];
        foreach ($labeledThingsInFrames as $labeledThingsInFrame) {
            $labeledThing = $labeledThingFacade->find($labeledThingsInFrame->getLabeledThingId());
            if ($labeledThing === null) {
                $invalidLabeledThingInFrames[] = $labeledThingsInFrame;
            }
        }

        return $invalidLabeledThingInFrames;
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingInFrames
     * @param                             $dryRun
     * @param                             $logFilePath
     */
    private function deleteLabeledThingInFrames($labeledThingInFrames, $frameNumberMapping, $dryRun, $logFilePath)
    {
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                $labeledThingInFrame->getProjectId(),
                $labeledThingInFrame->getTaskId()
            );
            if (!$dryRun) {
                $labeledThingInFrameFacade->delete([$labeledThingInFrame]);
                file_put_contents(
                    $logFilePath,
                    sprintf(
                        "%s;%s;%s%s",
                        $labeledThingInFrame->getProjectId(),
                        $labeledThingInFrame->getTaskId(),
                        $frameNumberMapping[$labeledThingInFrame->getFrameIndex()],
                        "\n"
                    ),
                    FILE_APPEND
                );
            }
        }
    }
}