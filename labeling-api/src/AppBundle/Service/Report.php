<?php

namespace AppBundle\Service;

use AppBundle\Model;
use AppBundle\Database\Facade;

class Report
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\Report
     */
    private $reportFacade;

    /**
     * Report constructor.
     * @param Facade\Project             $projectFacade
     * @param Facade\Video               $videoFacade
     * @param Facade\LabelingTask        $labelingTaskFacade
     * @param Facade\LabeledThing        $labeledThingFacade
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     * @param Facade\Report              $reportFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\Video $videoFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\LabeledThing $labeledThingFacade,
        Facade\LabeledThingInFrame $labeledThingInFrameFacade,
        Facade\Report $reportFacade
    )
    {
        $this->projectFacade             = $projectFacade;
        $this->videoFacade               = $videoFacade;
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->labeledThingFacade        = $labeledThingFacade;
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
        $this->reportFacade              = $reportFacade;
    }

    public function processReport(Model\Report $report)
    {
        $project = $this->projectFacade->find($report->getProjectId());
        $report->setProjectStatus($project->getStatus());
        $report->setProjectCreatedAt($project->getCreationDate());
        $report->setProjectDueDate($project->getDueDate());

        $report->setNumberOfTasksInProject(
            $this->getNumberOfTaskInProject($project)
        );
        $report->setNumberOfVideosInProject(
            $this->getNumberOfVideosInProject($project)
        );

        /** Number of Tasks by Status */
        $numberOfToDoTasks = $this->labelingTaskFacade->getSumOfTasksByProjectAndStatus(
            $project,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_TODO
        )->toArray();
        $numberOfToDoTasks = count($numberOfToDoTasks) === 0 ? 0 : $numberOfToDoTasks[0]['value'];
        $report->setNumberOfToDoTasks($numberOfToDoTasks);

        $numberOfInProgressTasks = $this->labelingTaskFacade->getSumOfTasksByProjectAndStatus(
            $project,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS
        )->toArray();
        $numberOfInProgressTasks = count($numberOfInProgressTasks) === 0 ? 0 : $numberOfInProgressTasks[0]['value'];
        $report->setNumberOfInProgressTasks($numberOfInProgressTasks);

        $numberOfDoneTasks = $this->labelingTaskFacade->getSumOfTasksByProjectAndStatus(
            $project,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_DONE
        )->toArray();
        $numberOfDoneTasks = count($numberOfDoneTasks) === 0 ? 0 : $numberOfDoneTasks[0]['value'];
        $report->setNumberOfDoneTasks($numberOfDoneTasks);

        /** Number of Review Tasks by Status */
        $report->setNumberOfToDoReviewTasks(0);
        $report->setNumberOfInProgressReviewTasks(0);
        $report->setNumberOfDoneReviewTasks(0);

        /** Number of Revision Tasks by Status */
        $report->setNumberOfToDoRevisionTasks(0);
        $report->setNumberOfInProgressRevisionTasks(0);
        $report->setNumberOfDoneRevisionTasks(0);

        $report->setNumberOfLabeledThings(
            $this->getSumOfLabeledThings($project)
        );
        $report->setNumberOfLabeledThingClasses(
            $this->getSumOfLabeledThingClasses($project)
        );

        $report->setNumberOfLabeledThingInFrames(
            $this->labeledThingInFrameFacade->getSumOfLabeledThingInFramesByProject($project)
        );

        $report->setNumberOfLabeledThingInFrameClasses(
            $this->getSumOfLabeledThingInFrameClasses($project)
        );

        $timeByPhaseForProject = $this->projectFacade->getTimeForProject($project);
        $sumOfTimeByPhase = 0;
        foreach($timeByPhaseForProject as $phase => $time) {
            $sumOfTimeByPhase += $time;
        }
        $report->setTotalTime($sumOfTimeByPhase);
        $report->setTotalLabelingTime(0);
        $report->setTotalReviewTime(0);
        $report->setTotalRevisionTime(0);

        $report->setReportStatus(Model\Report::REPORT_STATUS_DONE);
        $this->reportFacade->save($report);
    }

    /**
     * @param $project
     * @return int
     */
    private function getSumOfLabeledThings($project)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);
        $count = 0;
        foreach ($tasks as $task) {
            $count += count($this->labelingTaskFacade->getLabeledThings($task));
        }

        return $count;
    }

    /**
     * @param $project
     * @return int|number
     */
    private function getSumOfLabeledThingClasses($project)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);
        $count = 0;
        foreach ($tasks as $task) {
            $labeledThingsClassCount = array_map(function (Model\LabeledThing $labeledThing) {
                return count($labeledThing->getClasses());
            }, $this->labelingTaskFacade->getLabeledThings($task));

            $count += array_sum($labeledThingsClassCount);
        }

        return $count;
    }

    /**
     * @param $project
     * @return int|number
     */
    private function getSumOfLabeledThingInFrameClasses($project)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);
        $count = 0;
        foreach ($tasks as $task) {
            $labeledThingInFramesClassCount = array_map(function (Model\LabeledThingInFrame $labeledThingInFrame) {
                return count($labeledThingInFrame->getClasses());
            }, $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task));
            $count += array_sum($labeledThingInFramesClassCount);
        }

        return $count;
    }

    /**
     * @param Model\Project $project
     * @return int
     */
    private function getNumberOfTaskInProject(Model\Project $project)
    {
        $sumOfTasksByProjectAndPhase = $this->labelingTaskFacade->getSumOfTasksByProject($project);

        $phases = array(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION
        );

        $sumOfTasks = 0;
        foreach ($phases as $phase) {
            $sumOfTasks += array_sum($sumOfTasksByProjectAndPhase[$phase]);
        }

        return $sumOfTasks;
    }

    /**
     * @param Model\Project $project
     * @return array
     */
    private function getNumberOfVideosInProject(Model\Project $project)
    {
        $videosByProjects = $this->labelingTaskFacade->findAllByProjects([$project]);
        $numberOfVideos = array();
        foreach($videosByProjects as $videosByProject) {
            $projectId = $videosByProject['key'];
            $videoId = $videosByProject['value'];
            $numberOfVideos[$projectId][] = $videoId;
        }
        $numberOfVideos = array_map(
            function($videoByProject) {
                return count(array_unique($videoByProject));
            },
            $numberOfVideos
        );

        return $numberOfVideos[$project->getId()];
    }
}