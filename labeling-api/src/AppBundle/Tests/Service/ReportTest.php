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
        $task    = $this->labelingTaskFacade->save(
            Model\LabelingTask::create($video, $project, [10, 100], Model\LabelingTask::TYPE_OBJECT_LABELING)
        );
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($task, $user, 1337));

        $taskToDo = Model\LabelingTask::create($video, $project, [10, 100], Model\LabelingTask::TYPE_OBJECT_LABELING);
        $taskToDo->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);
        $this->labelingTaskFacade->save($taskToDo);
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($taskToDo, $user, 1337));

        $taskInProgress = Model\LabelingTask::create(
            $video,
            $project,
            [10, 100],
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $taskInProgress->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $this->labelingTaskFacade->save($taskInProgress);
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($taskInProgress, $user, 1337));

        $taskDone = Model\LabelingTask::create($video, $project, [10, 100], Model\LabelingTask::TYPE_OBJECT_LABELING);
        $taskDone->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
        $this->labelingTaskFacade->save($taskDone);
        $this->labelingTaskFacade->saveTimer(new Model\TaskTimer($taskDone, $user, 1337));

        foreach (range(0, 9) as $i) {
            $labeledThing = Model\LabeledThing::create($task);
            $labeledThing->setClasses(['foobar', 'foobar2', 'foobar3']);
            $this->labeledThingFacade->save($labeledThing);
            $this->labeledThingInFrameFacade->save(
                Model\LabeledThingInFrame::create($labeledThing, 30, ['foobar', 'foobar2'])
            );
        }

        $report = Model\Report::create($project);
        $this->reportFacade->save($report);
        $this->reportService->processReport($report);
        $actualReport = $this->reportFacade->find($report->getId());

        $this->assertSame(Model\Report::REPORT_STATUS_DONE, $actualReport->getReportStatus());
        $this->assertSame($project->getId(), $actualReport->getProjectId());
        $this->assertSame($project->getStatus(), $actualReport->getProjectStatus());
        $this->assertSame($project->getCreationDate(), $actualReport->getProjectCreatedAt());
        $this->assertSame(null, $actualReport->getProjectMovedToInProgressAt()); //@TODO not implemented yet
        $this->assertSame(null, $actualReport->getProjectMovedToDoneAt()); //@TODO not implemented yet
        $this->assertSame(1, $actualReport->getNumberOfVideosInProject());
        $this->assertSame(4, $actualReport->getNumberOfTasksInProject());
        $this->assertSame(null, $actualReport->getProjectLabelType()); //@TODO not implemented yet
        $this->assertSame($project->getDueDate(), $actualReport->getProjectDueDate());

        $this->assertSame(1, $actualReport->getNumberOfToDoTasks());
        $this->assertSame(1, $actualReport->getNumberOfInProgressTasks());
        $this->assertSame(1, $actualReport->getNumberOfDoneTasks());

        $this->assertSame(0, $actualReport->getNumberOfToDoReviewTasks()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getNumberOfInProgressReviewTasks()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getNumberOfDoneReviewTasks()); //@TODO not implemented yet

        $this->assertSame(0, $actualReport->getNumberOfToDoRevisionTasks()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getNumberOfInProgressRevisionTasks()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getNumberOfDoneRevisionTasks()); //@TODO not implemented yet

        $this->assertSame(10, $actualReport->getNumberOfLabeledThingInFrames());
        $this->assertSame(20, $actualReport->getNumberOfLabeledThingInFrameClasses());

        $this->assertSame(10, $actualReport->getNumberOfLabeledThings());
        $this->assertSame(30, $actualReport->getNumberOfLabeledThingClasses());

        $this->assertSame(5348, $actualReport->getTotalTime());
        $this->assertSame(0, $actualReport->getTotalLabelingTime()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getTotalReviewTime()); //@TODO not implemented yet
        $this->assertSame(0, $actualReport->getTotalRevisionTime()); //@TODO not implemented yet
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
