<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

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
     * @var GhostClassesPropagation
     */
    private $ghostClassesPropagation;

    /**
     * Report constructor.
     *
     * @param Facade\Video                                    $videoFacade
     * @param Facade\Report                                   $reportFacade
     * @param GhostClassesPropagation                         $ghostClassesPropagation
     * @param AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Factory\Project                                 $projectFacadeFactory
     * @param Factory\LabelingTask                            $labelingTaskFacadeFactory
     * @param Factory\LabeledThing                            $labeledThingFacadeFactory
     * @param Factory\LabeledThingInFrame                     $labeledThingInFrameFacadeFactory
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\Report $reportFacade,
        Service\GhostClassesPropagation $ghostClassesPropagation,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Factory\Project $projectFacadeFactory,
        Factory\LabelingTask $labelingTaskFacadeFactory,
        Factory\LabeledThing $labeledThingFacadeFactory,
        Factory\LabeledThingInFrame $labeledThingInFrameFacadeFactory
    ) {
        $this->videoFacade               = $videoFacade;
        $this->reportFacade              = $reportFacade;
        $this->ghostClassesPropagation   = $ghostClassesPropagation;
        $this->projectFacade             = $projectFacadeFactory->getReadOnlyFacade();
        $this->labelingTaskFacade        = $labelingTaskFacadeFactory->getReadOnlyFacade();
        $this->labeledThingFacade        = $labeledThingFacadeFactory->getReadOnlyFacade();
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacadeFactory->getReadOnlyFacade();
    }

    /**
     * @param Model\Report $report
     *
     * @throws \Exception
     */
    public function processReport(Model\Report $report)
    {
        try {
            $project = $this->projectFacade->find($report->getProjectId());

            $report->setProjectStatus($project->getStatus());

            $report->setProjectCreatedAt($project->getCreationDate());
            $report->setProjectCreatedBy($project->getUserId());

            $projectMovedToInProgress = $project->getLastStateForStatus(Model\Project::STATUS_IN_PROGRESS);
            $projectMovedToDoneBy     = $project->getLastStateForStatus(Model\Project::STATUS_DONE);
            $report->setProjectMovedToInProgressBy($projectMovedToInProgress['userId']);
            $report->setProjectMovedToInProgressAt($projectMovedToInProgress['timestamp']);
            $report->setProjectMovedToDoneBy($projectMovedToDoneBy['userId']);
            $report->setProjectMovedToDoneAt($projectMovedToDoneBy['timestamp']);

            $report->setProjectDueDate($project->getDueDate());
            $report->setLabelingValidationProcesses($project->getLabelingValidationProcesses());

            $numberOfVideos = $this->getNumberOfVideosInProject($project);
            $report->setNumberOfVideosInProject($numberOfVideos);
            $numberOfTaskByPhaseAndStatus = $this->labelingTaskFacade->getSumOfTasksByPhaseForProject($project);
            $phases                       = array(
                Model\LabelingTask::PHASE_LABELING,
                Model\LabelingTask::PHASE_REVIEW,
                Model\LabelingTask::PHASE_REVISION,
            );

            $sumOfTasks = 0;
            foreach ($phases as $phase) {
                $sumOfTasks += array_sum($numberOfTaskByPhaseAndStatus[$phase]);
            }
            $report->setNumberOfTasksInProject($sumOfTasks);

            $numberOfLabelingTasks = $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_LABELING];
            $numberOfReviewTasks   = $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVIEW];
            $numberOfRevisionTasks = $numberOfTaskByPhaseAndStatus[Model\LabelingTask::PHASE_REVISION];

            /** Number of Labeling Tasks */
            $report->setNumberOfToDoTasks(
                $numberOfLabelingTasks[Model\LabelingTask::STATUS_TODO]
            );
            $report->setNumberOfInProgressTasks(
                $numberOfLabelingTasks[Model\LabelingTask::STATUS_IN_PROGRESS]
            );
            $report->setNumberOfDoneTasks(
                $numberOfLabelingTasks[Model\LabelingTask::STATUS_DONE]
            );

            /** Number of Review Tasks by Status */
            $report->setNumberOfToDoReviewTasks(
                $numberOfReviewTasks[Model\LabelingTask::STATUS_TODO]
            );
            $report->setNumberOfInProgressReviewTasks(
                $numberOfReviewTasks[Model\LabelingTask::STATUS_IN_PROGRESS]
            );
            $report->setNumberOfDoneReviewTasks(
                $numberOfReviewTasks[Model\LabelingTask::STATUS_DONE]
            );

            /** Number of Revision Tasks by Status */
            $report->setNumberOfToDoRevisionTasks(
                $numberOfRevisionTasks[Model\LabelingTask::STATUS_TODO]
            );
            $report->setNumberOfInProgressRevisionTasks(
                $numberOfRevisionTasks[Model\LabelingTask::STATUS_IN_PROGRESS]
            );
            $report->setNumberOfDoneRevisionTasks(
                $numberOfRevisionTasks[Model\LabelingTask::STATUS_DONE]
            );

            $report->setNumberOfDoneTasksInAllPhases(
                $this->labelingTaskFacade->getSumOfAllDoneLabelingTasksForProject($project)
            );

            $totalNumberOfLabeledThings = $this->getSumOfLabeledThings($project);
            $report->setNumberOfLabeledThings(
                $totalNumberOfLabeledThings
            );
            $report->setNumberOfLabeledThingClasses(
                $this->getSumOfLabeledThingClasses($project)
            );

            $totalNumberOfLabeledThingInFrames = $this->labeledThingInFrameFacade
                ->getSumOfLabeledThingInFramesByProject($project);
            $report->setNumberOfLabeledThingInFrames(
                $totalNumberOfLabeledThingInFrames
            );

            $report->setNumberOfLabeledThingInFrameClasses(
                $this->getSumOfLabeledThingInFrameClasses($project)
            );

            $report->setNumberOfTotalClassesInLabeledThingInFrameByClasses(
                $this->getLabeledClassesInNumbers($project)
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

            $report->setTotalTimeByTasksAndPhases($this->projectFacade->getTimeForLabelingTaskInProject($project));

            $projectMovedToDoneAt       = null;
            $projectMovedToDoneBy       = null;
            $projectMovedToInProgressAt = null;
            $projectMovedToInProgressBy = null;
            $projectStatusHistory       = $project->getStatusHistory();
            if (is_array($projectStatusHistory)) {
                usort(
                    $projectStatusHistory,
                    function ($a, $b) {
                        if ($a['timestamp'] === $b['timestamp']) {
                            return 0;
                        }

                        return ($a['timestamp'] > $b['timestamp']) ? -1 : 1;
                    }
                );
                foreach ($projectStatusHistory as $projectStatus) {
                    if ($projectStatus['status'] === Model\Project::STATUS_IN_PROGRESS &&
                        $projectMovedToInProgressAt === null && $projectMovedToInProgressBy === null
                    ) {
                        $projectMovedToInProgressAt = $projectStatus['timestamp'];
                        $projectMovedToInProgressBy = $projectStatus['userId'];
                    }
                    if ($projectStatus['status'] === Model\Project::STATUS_DONE &&
                        $projectMovedToDoneAt === null && $projectMovedToDoneBy === null
                    ) {
                        $projectMovedToDoneAt = $projectStatus['timestamp'];
                        $projectMovedToDoneBy = $projectStatus['userId'];
                    }
                }
            }
            $report->setProjectMovedToInProgressBy($projectMovedToInProgressBy);
            $report->setProjectMovedToInProgressAt($projectMovedToInProgressAt);
            $report->setProjectMovedToDoneBy($projectMovedToDoneBy);
            $report->setProjectMovedToDoneAt($projectMovedToDoneAt);

            $numberOfVideoFrames = $this->getSumOfVideoFramesForProject($project);

            if ($numberOfVideoFrames > 0) {
                $report->setAverageTimePerVideoFrame(round($sumOfTimeByPhase / $numberOfVideoFrames));
                $report->setAverageLabeledThingInFramesPerVideoFrame(
                    round($totalNumberOfLabeledThingInFrames / $numberOfVideoFrames)
                );
            }

            if ($numberOfVideos > 0) {
                $report->setAverageTimePerVideo(round($sumOfTimeByPhase / $numberOfVideos));
            }

            if ($totalNumberOfLabeledThings > 0) {
                $report->setAverageTimePerLabeledThing(round($sumOfTimeByPhase / $totalNumberOfLabeledThings));
            }

            if ($totalNumberOfLabeledThingInFrames > 0) {
                $report->setAverageTimePerLabeledThingInFrame(
                    round($sumOfTimeByPhase / $totalNumberOfLabeledThingInFrames)
                );
            }

            $report->setReportStatus(Model\Report::REPORT_STATUS_DONE);
            $this->reportFacade->save($report);
        } catch (\Exception $exception) {
            $report->setReportStatus(Model\Report::REPORT_STATUS_ERROR);
            $this->reportFacade->save($report);

            throw $exception;
        }
    }

    /**
     * @param Model\Project $project
     *
     * @return array
     */
    private function getLabeledClassesInNumbers(Model\Project $project)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);
        $classes = [];
        foreach ($tasks as $task) {
            $labeledThingInFrames           = $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task);
            $labeledThingInFramesWithGhosts = $this->ghostClassesPropagation->propagateGhostClasses(
                $labeledThingInFrames
            );
            foreach ($labeledThingInFramesWithGhosts as $labeledThingInFrame) {
                foreach ($labeledThingInFrame->getClassesWithGhostClasses() as $classWithGhostClass) {
                    if (isset($classes[$classWithGhostClass])) {
                        $classes[$classWithGhostClass] += 1;
                    } else {
                        $classes[$classWithGhostClass] = 1;
                    }
                }
            }
        }
        return $classes;
    }

    /**
     * @param $project
     *
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
     *
     * @return int|number
     */
    private function getSumOfLabeledThingClasses($project)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);
        $count = 0;
        foreach ($tasks as $task) {
            $labeledThingsClassCount = array_map(
                function (Model\LabeledThing $labeledThing) {
                    return count($labeledThing->getClasses());
                },
                $this->labelingTaskFacade->getLabeledThings($task)
            );

            $count += array_sum($labeledThingsClassCount);
        }

        return $count;
    }

    /**
     * @param $project
     *
     * @return int|number
     */
    private function getSumOfLabeledThingInFrameClasses($project)
    {
        $tasks = $this->projectFacade->getTasksByProject($project);
        $count = 0;
        foreach ($tasks as $task) {
            $labeledThingInFramesClassCount = array_map(
                function (Model\LabeledThingInFrame $labeledThingInFrame) {
                    return count($labeledThingInFrame->getClasses());
                },
                $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task)
            );
            $count += array_sum($labeledThingInFramesClassCount);
        }

        return $count;
    }

    /**
     * @param Model\Project $project
     *
     * @return int
     */
    private function getNumberOfVideosInProject(Model\Project $project)
    {
        $videosByProjects = $this->labelingTaskFacade->findAllByProjects([$project]);
        $numberOfVideos   = array();

        foreach ($videosByProjects as $videosByProject) {
            $projectId                    = $videosByProject['key'];
            $videoId                      = $videosByProject['value'];
            $numberOfVideos[$projectId][] = $videoId;
        }

        $numberOfVideos = array_map(
            function ($videoByProject) {
                return count(array_unique($videoByProject));
            },
            $numberOfVideos
        );

        return array_key_exists($project->getId(), $numberOfVideos) ? $numberOfVideos[$project->getId()] : 0;
    }

    private function getSumOfVideoFramesForProject(Model\Project $project)
    {
        $videosByProjects = $this->labelingTaskFacade->findAllByProjects([$project]);
        $videos           = array();
        foreach ($videosByProjects as $videosByProject) {
            $videoId  = $videosByProject['value'];
            $videos[] = $this->videoFacade->find($videoId);
        }

        return array_sum(
            array_map(
                function (Model\Video $video) {
                    return $video->getMetaData()->numberOfFrames;
                },
                array_filter(
                    $videos,
                    function (Model\Video $video) {
                        return isset($video->getMetaData()->numberOfFrames);
                    }
                )
            )
        );
    }
}
