<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Database\Facade\Project;
use AnnoStationBundle\Database\Facade\LabelingTask;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AppBundle\Model;
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
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * Report constructor.
     *
     * @param Facade\Video                                    $videoFacade
     * @param Facade\Report                                   $reportFacade
     * @param GhostClassesPropagation                         $ghostClassesPropagation
     * @param AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
     * @param Project\FacadeInterface                         $projectFacadeFactory
     * @param LabelingTask\FacadeInterface                    $labelingTaskFacadeFactory
     * @param LabeledThing\FacadeInterface                    $labeledThingFacadeFactory
     * @param LabeledThingInFrame\FacadeInterface             $labeledThingInFrameFacadeFactory
     * @param Facade\TaskConfiguration                        $taskConfigurationFacade
     */
    public function __construct(
        Facade\Video $videoFacade,
        Facade\Report $reportFacade,
        Service\GhostClassesPropagation $ghostClassesPropagation,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Project\FacadeInterface $projectFacadeFactory,
        LabelingTask\FacadeInterface $labelingTaskFacadeFactory,
        LabeledThing\FacadeInterface $labeledThingFacadeFactory,
        LabeledThingInFrame\FacadeInterface $labeledThingInFrameFacadeFactory,
        Facade\TaskConfiguration $taskConfigurationFacade
    ) {
        $this->videoFacade               = $videoFacade;
        $this->reportFacade              = $reportFacade;
        $this->ghostClassesPropagation   = $ghostClassesPropagation;
        $this->projectFacade             = $projectFacadeFactory->getReadOnlyFacade();
        $this->labelingTaskFacade        = $labelingTaskFacadeFactory->getReadOnlyFacade();
        $this->labeledThingFacade        = $labeledThingFacadeFactory->getReadOnlyFacade();
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacadeFactory->getReadOnlyFacade();
        $this->taskConfigurationFacade   = $taskConfigurationFacade;
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

            if ($report->getReportType() === Model\Report::REPORT_TYPE_REQUIREMENTS_XML) {
                $report->setNumberOfTotalClassesInLabeledThingInFrameByClasses(
                    $this->getRequirementsXmlLabeledClassesInNumbers($project)
                );
            } else {
                $report->setNumberOfTotalClassesInLabeledThingInFrameByClasses(
                    $this->getLegacyLabeledClassesInNumbers($project)
                );
            }

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
    private function getLegacyLabeledClassesInNumbers(Model\Project $project)
    {
        $tasks   = $this->projectFacade->getTasksByProject($project);
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
     * @param Model\Project $project
     *
     * @return array
     */
    private function getRequirementsXmlLabeledClassesInNumbers(Model\Project $project)
    {
        $tasks   = $this->projectFacade->getTasksByProject($project);
        $objects = [];
        foreach ($tasks as $task) {
            $taskConfiguration = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());

            $objects = array_merge($this->getInitialObjectFramesByObjectsTree($taskConfiguration), $objects);

            $labeledThingInFrames           = $this->labeledThingInFrameFacade->getLabeledThingsInFrame($task);
            $labeledThingInFramesWithGhosts = $this->ghostClassesPropagation->propagateGhostClasses(
                $labeledThingInFrames
            );

            $labeledThingsValueCache = [];
            $labeledThingsCache      = [];
            foreach ($labeledThingInFramesWithGhosts as $labeledThingInFrame) {
                $thingId = $labeledThingInFrame->getIdentifierName();
                foreach ($labeledThingInFrame->getClassesWithGhostClasses() as $valueId) {
                    $classId = $this->findClassIdForValue($valueId, $taskConfiguration);

                    if (!in_array(
                        $labeledThingInFrame->getLabeledThingId() . '-' . $valueId,
                        $labeledThingsValueCache
                    )) {
                        $objects[$thingId]['childs'][$classId]['childs'][$valueId]['labeledThings'] += 1;
                        $objects[$thingId]['childs'][$classId]['labeledThings']                     += 1;
                        $labeledThingsValueCache[]                                                  = $labeledThingInFrame->getLabeledThingId(
                            ) . '-' . $valueId;
                    }
                    if (!in_array($labeledThingInFrame->getLabeledThingId(), $labeledThingsCache)) {
                        $labeledThing                              = $this->labeledThingFacade->find(
                            $labeledThingInFrame->getLabeledThingId()
                        );
                        $objects[$thingId]['labeledThings']        += 1;
                        $objects[$thingId]['labeledThingInFrames'] += $labeledThing->getFrameRange()->getNumberOfFrames(
                        );
                        $labeledThingsCache[]                      = $labeledThingInFrame->getLabeledThingId();
                    }
                    $objects[$thingId]['childs'][$classId]['childs'][$valueId]['labeledThingInFrames'] += 1;
                    $objects[$thingId]['childs'][$classId]['labeledThingInFrames']                     += 1;
                }
            }
        }

        return $objects;
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
            $count += count($this->labeledThingFacade->findByTaskId($task));
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
                $this->labeledThingFacade->findByTaskId($task)
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
            $count                          += array_sum($labeledThingInFramesClassCount);
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

    /**
     * @param Model\Project $project
     *
     * @return float|int
     */
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

    /**
     * @param Model\TaskConfiguration $taskConfiguration
     *
     * @return array
     */
    private function getInitialObjectFramesByObjectsTree(Model\TaskConfiguration $taskConfiguration)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->loadXML($taskConfiguration->getRawData());

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/requirements");

        $thingElements = $xpath->query('//x:thing');

        $objects = [];
        foreach ($thingElements as $thingElement) {
            $thingId            = $thingElement->getAttribute('id');
            $thingClassElements = $xpath->query(sprintf('//x:thing[@id="%s"]//x:class', $thingId));
            $childs             = [];

            foreach ($thingClassElements as $thingClassElement) {
                if ($thingClassElement->hasAttribute('ref')) {
                    $values = $xpath->query(
                        sprintf('//x:class[@id="%s"]//x:value', $thingClassElement->getAttribute('ref'))
                    );
                } else {
                    $values = $xpath->query('x:value', $thingClassElement);
                }

                foreach ($values as $value) {
                    $valueId = $value->getAttribute('id');
                    $classId = $value->parentNode->getAttribute('id');

                    if (isset($childs[$classId])) {
                        $childs[$classId]['childs'][$valueId] = [
                            'type'                 => 'value',
                            'labeledThings'        => 0,
                            'labeledThingInFrames' => 0,
                        ];
                    } else {
                        $childs[$classId] = [
                            'type'                 => 'class',
                            'labeledThings'        => 0,
                            'labeledThingInFrames' => 0,
                            'childs'               => [
                                $valueId => [
                                    'type'                 => 'value',
                                    'labeledThings'        => 0,
                                    'labeledThingInFrames' => 0,
                                ],
                            ],
                        ];
                    }
                }
            }
            $objects[$thingId] = [
                'type'                 => 'thing',
                'labeledThings'        => 0,
                'labeledThingInFrames' => 0,
                'childs'               => $childs,
            ];
        }

        return $objects;
    }

    /**
     * @param                         $value
     * @param Model\TaskConfiguration $taskConfiguration
     *
     * @return string
     */
    private function findClassIdForValue($value, Model\TaskConfiguration $taskConfiguration)
    {
        $xmlImport = new \DOMDocument();
        $xmlImport->loadXML($taskConfiguration->getRawData());

        $xpath = new \DOMXPath($xmlImport);
        $xpath->registerNamespace('x', "http://weblabel.hella-aglaia.com/schema/requirements");

        $requirementsElement = $xpath->query(sprintf('//x:value[@id="%s"]', $value));

        if ($requirementsElement->length === 0) {
            throw new \RuntimeException(
                sprintf(
                    'Could not find any class for value "%s" in TaskConfiguration "%s"',
                    $value,
                    $taskConfiguration->getId()
                )
            );
        }

        return $requirementsElement->item(0)->parentNode->getAttribute('id');
    }
}
