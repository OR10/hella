<?php

namespace AppBundle\Tests\Service;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Tests;
use FOS\UserBundle\Util;

class ReportTest extends Tests\KernelTestCase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\Report
     */
    private $reportFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;
    /**
     * @var Service\Report
     */
    private $reportService;

    public function testProcessReport()
    {
        /** @var Model\User $user */
        $user = $this->getService('fos_user.util.user_manipulator')
            ->create('foobar', 'baar', 'foobar@baar.de', true, false);

        $creationDate = new \DateTime('2016-07-27 00:00:00', new \DateTimeZone('UTC'));
        $dueDate      = new \DateTime('2016-07-29 00:00:00', new \DateTimeZone('UTC'));

        $project = $this->projectFacade->save(Model\Project::create('foo', $user->getId(), $creationDate, $dueDate));
        $video   = $this->videoFacade->save(Model\Video::create('foobar'));

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_TODO,
            100,
            2
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            200,
            3
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_DONE,
            300,
            4
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::STATUS_TODO,
            400,
            5
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            500,
            4
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::STATUS_DONE,
            600,
            3
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_REVISION,
            Model\LabelingTask::STATUS_TODO,
            700,
            4
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_REVISION,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            800,
            3
        );

        $this->createLabelingTasks(
            $video,
            $project,
            $user,
            Model\LabelingTask::PHASE_REVISION,
            Model\LabelingTask::STATUS_DONE,
            900,
            2
        );

        $report = Model\Report::create($project);
        $this->reportFacade->save($report);
        $this->reportService->processReport($report);
        $actualReport = $this->reportFacade->find($report->getId());

        $this->assertSame(Model\Report::REPORT_STATUS_DONE, $actualReport->getReportStatus());
        $this->assertSame($project->getId(), $actualReport->getProjectId());
        $this->assertSame($project->getStatus(), $actualReport->getProjectStatus());
        $this->assertSame($project->getCreationDate(), $actualReport->getProjectCreatedAt());
        $this->assertSame($project->getUserId(), $actualReport->getProjectCreatedBy());
        $this->assertSame(null, $actualReport->getProjectMovedToInProgressAt()); //@TODO not implemented yet
        $this->assertSame(null, $actualReport->getProjectMovedToDoneAt()); //@TODO not implemented yet
        $this->assertSame(1, $actualReport->getNumberOfVideosInProject());
        $this->assertSame(60, $actualReport->getNumberOfTasksInProject());
        $this->assertSame(null, $actualReport->getProjectLabelType()); //@TODO not implemented yet
        $this->assertSame($project->getDueDate(), $actualReport->getProjectDueDate());

        $this->assertSame(2, $actualReport->getNumberOfToDoTasks());
        $this->assertSame(3, $actualReport->getNumberOfInProgressTasks());
        $this->assertSame(25, $actualReport->getNumberOfDoneTasks());

        $this->assertSame(5, $actualReport->getNumberOfToDoReviewTasks());
        $this->assertSame(4, $actualReport->getNumberOfInProgressReviewTasks());
        $this->assertSame(12, $actualReport->getNumberOfDoneReviewTasks());

        $this->assertSame(4, $actualReport->getNumberOfToDoRevisionTasks());
        $this->assertSame(3, $actualReport->getNumberOfInProgressRevisionTasks());
        $this->assertSame(2, $actualReport->getNumberOfDoneRevisionTasks());

        $this->assertSame(300, $actualReport->getNumberOfLabeledThingInFrames());
        $this->assertSame(600, $actualReport->getNumberOfLabeledThingInFrameClasses());

        $this->assertSame(300, $actualReport->getNumberOfLabeledThings());
        $this->assertSame(900, $actualReport->getNumberOfLabeledThingClasses());

        $this->assertSame(27600, $actualReport->getTotalTime());
        $this->assertSame(0, $actualReport->getTotalLabelingTime()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getTotalReviewTime()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getTotalRevisionTime()); //@TODO not implemented yet
    }

    private function createLabelingTasks(
        Model\Video $video,
        Model\Project $project,
        Model\User $user,
        $phase,
        $status,
        $timeInSeconds,
        $numberOfTasks
    ) {
        foreach (range(1, $numberOfTasks) as $i) {
            $task = Model\LabelingTask::create($video, $project, [10, 100], Model\LabelingTask::TYPE_OBJECT_LABELING);
            $task->setStatus($phase, $status);
            if ($phase === Model\LabelingTask::PHASE_REVIEW || $phase === Model\LabelingTask::PHASE_REVISION) {
                $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
            }
            if ($phase === Model\LabelingTask::PHASE_REVISION) {
                $task->setStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_DONE);
            }
            $this->labelingTaskFacade->save($task);
            $timer = new Model\TaskTimer($task, $user, $timeInSeconds);
            $timer->setTimeInSeconds($phase, $timeInSeconds);
            $this->labelingTaskFacade->saveTimer($timer);

            foreach (range(0, 9) as $i2) {
                $labeledThing = Model\LabeledThing::create($task);
                $labeledThing->setClasses(['foobar', 'foobar2', 'foobar3']);
                $this->labeledThingFacade->save($labeledThing);
                $this->labeledThingInFrameFacade->save(
                    Model\LabeledThingInFrame::create($labeledThing, 30, ['foobar', 'foobar2'])
                );
            }
        }
    }

    public function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->reportFacade              = $this->getAnnostationService('database.facade.report');
        $this->reportService             = $this->getAnnostationService('service.report');
    }
}
