<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Model;
use AnnoStationBundle\Service;
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
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Service\Report
     */
    private $reportService;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var array
     */
    private $expectedTotalTimeByTasksAndPhases;

    public function testProcessReport()
    {
        $phases = [
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION,
        ];
        /** @var Model\User $user */
        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create('foobar', 'baar', 'foobar@baar.de', true, false);

        /** @var Model\User $moveToInProgressUser */
        $moveToInProgressUser = $this->getService('fos_user.util.user_manipulator')
            ->create('in_progress_user', 'in_progress_user', 'in_progress_user@foo.de', true, false);

        /** @var Model\User $moveToDoneUser */
        $moveToDoneUser = $this->getService('fos_user.util.user_manipulator')
            ->create('done_user', 'done_user', 'done_user@foo.de', true, false);

        $creationDate = new \DateTime('2016-07-27 00:00:00', new \DateTimeZone('UTC'));
        $dueDate      = new \DateTime('2016-07-29 00:00:00', new \DateTimeZone('UTC'));

        $projectMovedToInProgressDateTime = new \DateTime('2016-09-09 10:00', new \DateTimeZone('UTC'));
        $projectMovedToDoneDateTime       = new \DateTime('2016-09-09 15:00', new \DateTimeZone('UTC'));

        $organisation = Helper\OrganisationBuilder::create()->build();

        $this->project = Helper\ProjectBuilder::create($organisation)
            ->withCreationDate($creationDate)
            ->withProjectOwnedByUserId($this->user)
            ->withDueDate($dueDate)
            ->withPhases($phases)
            ->withStatusChange(
                Model\Project::STATUS_IN_PROGRESS,
                $projectMovedToInProgressDateTime,
                $moveToInProgressUser
            )
            ->withStatusChange(Model\Project::STATUS_DONE, $projectMovedToDoneDateTime, $moveToDoneUser)
            ->build();

        $this->project = $this->projectFacade->save($this->project);

        $this->video                   = Model\Video::create($organisation, 'foobar');
        $videoMetaData                 = new Model\Video\MetaData();
        $videoMetaData->numberOfFrames = 661;
        $this->video->setMetaData($videoMetaData);
        $this->video = $this->videoFacade->save($this->video);

        $this->createLabelingTasks(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO, 100, 2);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS, 200, 3);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE, 300, 4);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_TODO, 400, 5);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_IN_PROGRESS, 500, 4);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_DONE, 600, 3);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_TODO, 700, 4);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_IN_PROGRESS, 800, 3);
        $this->createLabelingTasks(Model\LabelingTask::PHASE_REVISION, Model\LabelingTask::STATUS_DONE, 900, 2);

        $report = Model\Report::create($this->project);
        $this->reportFacade->save($report);
        $this->reportService->processReport($report);
        $actualReport = $this->reportFacade->find($report->getId());

        $this->assertEquals(Model\Report::REPORT_STATUS_DONE, $actualReport->getReportStatus());
        $this->assertEquals($this->project->getId(), $actualReport->getProjectId());
        $this->assertEquals($this->project->getStatus(), $actualReport->getProjectStatus());

        $this->assertEquals($this->project->getCreationDate(), $actualReport->getProjectCreatedAt());
        $this->assertEquals($this->project->getUserId(), $actualReport->getProjectCreatedBy());
        $this->assertEquals($projectMovedToDoneDateTime->getTimestamp(), $actualReport->getProjectMovedToDoneAt());
        $this->assertEquals($moveToDoneUser->getId(), $actualReport->getProjectMovedToDoneBy());
        $this->assertEquals(
            $projectMovedToInProgressDateTime->getTimestamp(),
            $actualReport->getProjectMovedToInProgressAt()
        );
        $this->assertEquals($moveToInProgressUser->getId(), $actualReport->getProjectMovedToInProgressBy());

        $this->assertEquals(1, $actualReport->getNumberOfVideosInProject());
        $this->assertEquals(60, $actualReport->getNumberOfTasksInProject());
        $this->assertEquals($phases, $actualReport->getLabelingValidationProcesses());
        $this->assertEquals($this->project->getDueDate(), $actualReport->getProjectDueDate());

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
        $this->assertEquals(300, $actualReport->getNumberOfLabeledThingInFrameClasses());

        $this->assertEquals(30, $actualReport->getNumberOfLabeledThings());
        $this->assertEquals(90, $actualReport->getNumberOfLabeledThingClasses());

        $this->assertEquals(
            ['foobar1' => 300, 'foobar2' => 300],
            $actualReport->getNumberOfTotalClassesInLabeledThingInFrameByClasses()
        );

        $this->assertEquals(
            79200,
            $actualReport->getNumberOfLabeledFrames()
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

        $this->assertEquals(14800, $actualReport->getTotalTime());
        $this->assertEquals(2000, $actualReport->getTotalLabelingTime());
        $this->assertEquals(5800, $actualReport->getTotalReviewTime());
        $this->assertEquals(7000, $actualReport->getTotalRevisionTime());

        $this->assertEquals($this->expectedTotalTimeByTasksAndPhases, $actualReport->getTotalTimeByTasksAndPhases());

        $this->assertEquals(
            0.0,
            $actualReport->getAverageLabeledThingInFramesPerVideoFrame()
        );

        $this->assertEquals(
            493.0,
            $actualReport->getAverageTimePerLabeledThing()
        );

        $this->assertEquals(
            49.0,
            $actualReport->getAverageTimePerLabeledThingInFrame()
        );

        $this->assertEquals(
            14800.0,
            $actualReport->getAverageTimePerVideo()
        );

        $this->assertEquals(
            1.0,
            $actualReport->getAverageTimePerVideoFrame()
        );
    }

    private function createLabelingTasks(
        $phase,
        $status,
        $timeInSeconds,
        $numberOfTasks
    ) {
        foreach (range(1, $numberOfTasks) as $i) {
            $task = Helper\LabelingTaskBuilder::create($this->project, $this->video)
                ->withStatus($phase, $status)
                ->build();
            $this->labelingTaskFacade->save($task);
            $this->expectedTotalTimeByTasksAndPhases[$task->getId()][Model\LabelingTask::PHASE_LABELING] = 0;
            $this->expectedTotalTimeByTasksAndPhases[$task->getId()][$phase] = $timeInSeconds;

            $timer = Helper\LabelingTimerBuilder::create()
                ->withTask($task)
                ->withUser($this->user)
                ->withTimeInSeconds($timeInSeconds)
                ->withPhase($phase)
                ->build();
            $this->labelingTaskFacade->saveTimer($timer);

            $frameIndexRange = new Model\FrameIndexRange(1, 20);
            $labeledThing = Helper\LabeledThingBuilder::create()->withTask($task)->withFrameRange(
                $frameIndexRange
            )->build();
            $this->labeledThingFacade->save($labeledThing);

            foreach (range(1, 5) as $i2) {
                $this->labeledThingInFrameFacade->save(
                    Helper\LabeledThingInFrameBuilder::create()
                        ->withLabeledThing($labeledThing)
                        ->withFrameIndex($i2)
                        ->build()
                );
            }
            foreach (range(6, 10) as $i3) {
                $this->labeledThingInFrameFacade->save(
                    Helper\LabeledThingInFrameBuilder::create()
                        ->withLabeledThing($labeledThing)
                        ->withFrameIndex($i3)
                        ->withClasses([])
                        ->build()
                );
            }
            foreach (range(1, 2) as $i4) {
                $this->labeledFrameFacade->save(
                    Helper\LabeledFrameBuilder::create($task, $i4)
                    ->withClasses(['foo1', 'foo2', 'foo3', 'foo4'])
                    ->build()
                );
            }
        }
    }

    public function setUpImplementation()
    {
        $databaseNameReadOnly = $this->getContainer()->getParameter('database_name_read_only');

        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->labeledFrameFacade        = $this->getAnnostationService('database.facade.labeled_frame');
        $this->reportFacade              = $this->getAnnostationService('database.facade.report');
        $this->reportService             = $this->getAnnostationService('service.report');
        $userPermissionsService          = $this->getAnnostationService('service.authentication.user_permissions');

        $databaseDocumentManagerFactory  = $this->getService(
            'annostation.services.database_document_manager_factory'
        );
        $databaseDocumentManager         = $databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $databaseNameReadOnly
        );
        $this->projectFacade             = new Facade\Project($databaseDocumentManager, $userPermissionsService);
        $this->labelingTaskFacade        = new Facade\LabelingTask($databaseDocumentManager);
        $this->labeledThingFacade        = new Facade\LabeledThing($databaseDocumentManager);
        $this->labeledThingInFrameFacade = new Facade\LabeledThingInFrame($databaseDocumentManager);
        $this->labeledFrameFacade        = new Facade\LabeledFrame($databaseDocumentManager);
    }
}
