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
        $phases = [
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION,
        ];
        /** @var Model\User $user */
        $user = $this->getService('fos_user.util.user_manipulator')
            ->create('foobar', 'baar', 'foobar@baar.de', true, false);

        /** @var Model\User $moveToInProgressUser */
        $moveToInProgressUser = $this->getService('fos_user.util.user_manipulator')
            ->create('in_progress_user', 'in_progress_user', 'in_progress_user@foo.de', true, false);

        /** @var Model\User $moveToDoneUser */
        $moveToDoneUser = $this->getService('fos_user.util.user_manipulator')
            ->create('done_user', 'done_user', 'done_user@foo.de', true, false);

        $creationDate = new \DateTime('2016-07-27 00:00:00', new \DateTimeZone('UTC'));
        $dueDate      = new \DateTime('2016-07-29 00:00:00', new \DateTimeZone('UTC'));

        $project = Model\Project::create(
            'foo',
            $user,
            $creationDate,
            $dueDate,
            $phases
        );

        $projectMovedToInProgressDateTime = new \DateTime('2016-09-09 10:00', new \DateTimeZone('UTC'));
        $projectMovedToDoneDateTime       = new \DateTime('2016-09-09 15:00', new \DateTimeZone('UTC'));
        $project->addStatusHistory(
            $moveToInProgressUser,
            $projectMovedToInProgressDateTime,
            Model\Project::STATUS_IN_PROGRESS
        );

        $project->addStatusHistory(
            $moveToDoneUser,
            new \DateTime('2016-09-09 15:00', new \DateTimeZone('UTC')),
            Model\Project::STATUS_DONE
        );
        $project = $this->projectFacade->save($project);

        $video                         = Model\Video::create('foobar');
        $videoMetaData                 = new Model\Video\MetaData();
        $videoMetaData->numberOfFrames = 661;
        $video->setMetaData($videoMetaData);
        $video = $this->videoFacade->save($video);

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

        $this->assertEquals(Model\Report::REPORT_STATUS_DONE, $actualReport->getReportStatus());
        $this->assertEquals($project->getId(), $actualReport->getProjectId());
        $this->assertEquals($project->getStatus(), $actualReport->getProjectStatus());

        $this->assertEquals($project->getCreationDate(), $actualReport->getProjectCreatedAt());
        $this->assertEquals($project->getUserId(), $actualReport->getProjectCreatedBy());
        $this->assertEquals($projectMovedToDoneDateTime->getTimestamp(), $actualReport->getProjectMovedToDoneAt());
        $this->assertEquals($moveToDoneUser->getId(), $actualReport->getProjectMovedToDoneBy());
        $this->assertEquals($projectMovedToInProgressDateTime->getTimestamp(), $actualReport->getProjectMovedToInProgressAt());
        $this->assertEquals($moveToInProgressUser->getId(), $actualReport->getProjectMovedToInProgressBy());

        $this->assertEquals(1, $actualReport->getNumberOfVideosInProject());
        $this->assertEquals(60, $actualReport->getNumberOfTasksInProject());
        $this->assertEquals($phases, $actualReport->getLabelingValidationProcesses());
        $this->assertEquals($project->getDueDate(), $actualReport->getProjectDueDate());

        $this->assertEquals(2, $actualReport->getNumberOfToDoTasks());
        $this->assertEquals(3, $actualReport->getNumberOfInProgressTasks());
        $this->assertEquals(25, $actualReport->getNumberOfDoneTasks());

        $this->assertEquals(5, $actualReport->getNumberOfToDoReviewTasks());
        $this->assertEquals(4, $actualReport->getNumberOfInProgressReviewTasks());
        $this->assertEquals(12, $actualReport->getNumberOfDoneReviewTasks());

        $this->assertEquals(4, $actualReport->getNumberOfToDoRevisionTasks());
        $this->assertEquals(3, $actualReport->getNumberOfInProgressRevisionTasks());
        $this->assertEquals(2, $actualReport->getNumberOfDoneRevisionTasks());

        $this->assertEquals(300, $actualReport->getNumberOfLabeledThingInFrames());
        $this->assertEquals(600, $actualReport->getNumberOfLabeledThingInFrameClasses());

        $this->assertEquals(30, $actualReport->getNumberOfLabeledThings());
        $this->assertEquals(90, $actualReport->getNumberOfLabeledThingClasses());

        $this->assertEquals(
            ['foobar' => 300, 'foobar2' => 300],
            $actualReport->getNumberOfTotalClassesInLabeledThingInFrameByClasses()
        );

        $this->assertEquals(
            ['foobar' => 30, 'foobar2' => 30],
            $actualReport->getNumberOfUniqueClassesInLabeledThingInFrameByClasses()
        );

        $this->assertEquals(
            $moveToInProgressUser->getId(),
            $actualReport->getProjectMovedToInProgressBy()
        );

        $this->assertEquals(
            $projectMovedToInProgressDateTime->getTimestamp(),
            $actualReport->getProjectMovedToInProgressAt()
        );

        $this->assertEquals(
            $moveToDoneUser->getId(),
            $actualReport->getProjectMovedToDoneBy()
        );

        $this->assertEquals(
            $projectMovedToDoneDateTime->getTimestamp(),
            $actualReport->getProjectMovedToDoneAt()
        );

        $this->assertEquals(27600, $actualReport->getTotalTime());
        $this->assertEquals(14800, $actualReport->getTotalLabelingTime());
        $this->assertEquals(5800, $actualReport->getTotalReviewTime());
        $this->assertEquals(7000, $actualReport->getTotalRevisionTime());

        $this->assertEquals(
            0.0,
            $actualReport->getAverageLabeledThingInFramesPerVideoFrame()
        );

        $this->assertEquals(
            920.0,
            $actualReport->getAverageTimePerLabeledThing()
        );

        $this->assertEquals(
            92.0,
            $actualReport->getAverageTimePerLabeledThingInFrame()
        );

        $this->assertEquals(
            27600.0,
            $actualReport->getAverageTimePerVideo()
        );

        $this->assertEquals(
            1.0,
            $actualReport->getAverageTimePerVideoFrame()
        );
    }

    private function createLabelingTasks(
        Model\Video $video,
        Model\Project $project,
        Model\User $user,
        $phase,
        $status,
        $timeInSeconds,
        $numberOfTasks
    )
    {
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

            $labeledThing = Model\LabeledThing::create($task);
            $labeledThing->setClasses(['foobar', 'foobar2', 'foobar3']);
            foreach (range(0, 9) as $i2) {
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
