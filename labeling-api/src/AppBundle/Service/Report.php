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
    ) {
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
        $report->setProjectCreatedBy($project->getUserId());
        $report->setProjectDueDate($project->getDueDate());
        $report->setLabelingValidationProcesses($project->getLabelingValidationProcesses());

        $report->setNumberOfVideosInProject(
            $this->getNumberOfVideosInProject($project)
        );
        $numberOfTaskByPhaseAndStatus = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);
        $phases = array(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION
        );

        $sumOfTasks = 0;
        foreach ($phases as $phase) {
            $sumOfTasks += array_sum($numberOfTaskByPhaseAndStatus[$phase]);
        }
        $report->setNumberOfTasksInProject($sumOfTasks);

        /** Number of Labeling Tasks */
        $report->setNumberOfToDoTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_LABELING][Model\LabelingTask::STATUS_TODO]
        );
        $report->setNumberOfInProgressTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_LABELING][Model\LabelingTask::STATUS_IN_PROGRESS]
        );
        $report->setNumberOfDoneTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_LABELING][Model\LabelingTask::STATUS_DONE]
        );

        /** Number of Review Tasks by Status */
        $report->setNumberOfToDoReviewTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVIEW][Model\LabelingTask::STATUS_TODO]
        );
        $report->setNumberOfInProgressReviewTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVIEW][Model\LabelingTask::STATUS_IN_PROGRESS]
        );
        $report->setNumberOfDoneReviewTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVIEW][Model\LabelingTask::STATUS_DONE]
        );

        /** Number of Revision Tasks by Status */
        $report->setNumberOfToDoRevisionTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVISION][Model\LabelingTask::STATUS_TODO]
        );
        $report->setNumberOfInProgressRevisionTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVISION][Model\LabelingTask::STATUS_IN_PROGRESS]
        );
        $report->setNumberOfDoneRevisionTasks(
            $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVISION][Model\LabelingTask::STATUS_DONE]
        );

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

        $report->setNumberOfTotalClassesInLabeledThingInFrameByClasses(
            $this->labeledThingInFrameFacade->getSumOfTotalClassesForProject($project)
        );

        $report->setNumberOfUniqueClassesInLabeledThingInFrameByClasses(
            $this->labeledThingInFrameFacade->getSumOfUniqueClassesForProject($project)
        );

        $timeByPhaseForProject = $this->projectFacade->getTimeForProject($project);
        foreach ($phases as $phase) {
            if (!key_exists($phase, $timeByPhaseForProject)) {
                $timeByPhaseForProject[$phase] = 0;
            }
        }
        $sumOfTimeByPhase = 0;
        foreach ($timeByPhaseForProject as $phase => $time) {
            $sumOfTimeByPhase += $time;
        }
        $report->setTotalTime($sumOfTimeByPhase);
        $report->setTotalLabelingTime($timeByPhaseForProject[Model\LabelingTask::PHASE_LABELING]);
        $report->setTotalReviewTime($timeByPhaseForProject[Model\LabelingTask::PHASE_REVIEW]);
        $report->setTotalRevisionTime($timeByPhaseForProject[Model\LabelingTask::PHASE_REVISION]);

        $projectMovedToDoneAt       = null;
        $projectMovedToDoneBy       = null;
        $projectMovedToInProgressAt = null;
        $projectMovedToInProgressBy = null;
        $projectStatusHistory = $project->getStatusHistory();
        if (is_array($projectStatusHistory)) {
            usort($projectStatusHistory, function ($a, $b) {
                if ($a['timestamp'] === $b['timestamp']) {
                    return 0;
                }
                return ($a['timestamp'] > $b['timestamp']) ? -1 : 1;
            });
            foreach($projectStatusHistory as $projectStatus) {
                if ($projectStatus['status'] === Model\Project::STATUS_IN_PROGRESS &&
                    $projectMovedToInProgressAt === null && $projectMovedToInProgressBy === null) {
                    $projectMovedToInProgressAt = $projectStatus['timestamp'];
                    $projectMovedToInProgressBy = $projectStatus['userId'];
                }
                if ($projectStatus['status'] === Model\Project::STATUS_DONE &&
                    $projectMovedToDoneAt === null && $projectMovedToDoneBy === null) {
                    $projectMovedToDoneAt = $projectStatus['timestamp'];
                    $projectMovedToDoneBy = $projectStatus['userId'];
                }
            }
        }
        $report->setProjectMovedToInProgressBy($projectMovedToDoneBy);
        $report->setProjectMovedToInProgressAt($projectMovedToInProgressAt);
        $report->setProjectMovedToDoneBy($projectMovedToDoneBy);
        $report->setProjectMovedToDoneAt($projectMovedToDoneAt);

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
     * @return array
     */
    private function getNumberOfVideosInProject(Model\Project $project)
    {
        $videosByProjects = $this->labelingTaskFacade->findAllByProjects([$project]);
        $numberOfVideos = array();
        foreach ($videosByProjects as $videosByProject) {
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
