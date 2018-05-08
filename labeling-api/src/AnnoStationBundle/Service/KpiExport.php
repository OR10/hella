<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade\Exporter;
use AnnoStationBundle\Database\Facade\LabeledThing\TaskDatabase;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AnnoStationBundle\Database\Facade\Project;
use AnnoStationBundle\Helper\Iterator\LabeledThingCreateByUser;
use AnnoStationBundle\Helper\Iterator\LabeledThingModifyByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingCreateByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingInFrameByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingModifyByUser;
use AnnoStationBundle\Helper\Iterator\TotalTaskTime;
use AnnoStationBundle\Service\v1\TaskService;
use AppBundle\Model\Export;
use AppBundle\Model\LabelingTask;

class KpiExport
{
    /**
     * @var Project
     */
    private $projectFacade;

    /**
     * @var \AnnoStationBundle\Database\Facade\LabelingTask
     */
    private $labelingTask;

    /**
     * @var string
     */
    private $csv;

    /**
     * @var string
     */
    private $taskPhase;

    /**
     * @var TaskDatabase
     */
    private $labeledThingFacadeFactory;

    /**
     * @var LabeledThingInFrame\TaskDatabase
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var TaskService
     */
    private $taskService;

    /**
     * @var \AnnoStationBundle\Database\Facade\TaskTimer\TaskDatabase
     */
    private $taskTimerFacadeFactory;

    /**
     * @var LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Exporter
     */
    private $exporterFacade;

    /**
     * @var array
     */
    private $labelTasks = [];

    /**
     * @var array
     */
    private $userCreateLabelThingsIds = [];

    /**
     * @var array
     */
    private $userCreateRevisionThingsIds = [];

    /**
     * @var array
     */
    private $userModifyRevisionThingsIds = [];

    /**
     * @var array
     */
    private $userCreateReviewThingsIds = [];

    /**
     * @var array
     */
    private $userModifyReviewThingsIds = [];

    /**
     * @var array
     */
    private $revisionTasks = [];

    /**
     * @var array
     */
    private $reviewTasks = [];

    /**
     * @var array
     */
    private $defaultKpi = [];

    /**
     * KpiExport constructor.
     *
     * @param Project                                                   $projectFacade
     * @param \AnnoStationBundle\Database\Facade\LabelingTask           $labelingTask
     * @param TaskDatabase                                              $labelingThingFactory
     * @param TaskService                                               $taskService
     * @param \AnnoStationBundle\Database\Facade\TaskTimer\TaskDatabase $taskTimerFactory
     * @param LabeledThingInFrame\TaskDatabase                          $labelingThingInFrame
     * @param LabeledThingInFrame                                       $thingInFrameFacade
     * @param Exporter                                                  $exporter
     */
    public function __construct
    (
        Project $projectFacade,
        \AnnoStationBundle\Database\Facade\LabelingTask $labelingTask,
        TaskDatabase $labelingThingFactory,
        TaskService $taskService,
        \AnnoStationBundle\Database\Facade\TaskTimer\TaskDatabase $taskTimerFactory,
        LabeledThingInFrame\TaskDatabase $labelingThingInFrame,
        LabeledThingInFrame $thingInFrameFacade,
        Exporter $exporter
    )
    {
        $this->projectFacade                    = $projectFacade;
        $this->labelingTask                     = $labelingTask;
        $this->labeledThingFacadeFactory        = $labelingThingFactory;
        $this->taskService                      = $taskService;
        $this->taskTimerFacadeFactory           = $taskTimerFactory;
        $this->labeledThingInFrameFacadeFactory = $labelingThingInFrame;
        $this->labeledThingInFrameFacade        = $thingInFrameFacade;
        $this->exporterFacade                   = $exporter;

    }

    /**
     * @param Export $export
     *
     * @throws \Exception
     */
    public function build(Export $export)
    {
        $export = $this->exporterFacade->find($export->getId());
        $export->setStatus(Export::EXPORT_STATUS_IN_PROGRESS);
        $this->exporterFacade->save($export);
        try {
            $project = $this->projectFacade->find($export->getProjectId());
            $projectTask = $this->projectFacade->getTasksByProject($project);
            if($project && $projectTask) {

                $this->defaultKpi['UUID_of_the_project'] = [$project->getId()];
                $exportTime = date('d/m/Y h:m:s');
                foreach ($projectTask as $task) {
                    $this->defaultKpi['UUID_of_the_task'][] = $task->getId();
                    $lastUserAssignment = $task->getAssignmentHistory();
                    $this->defaultKpi['UUID_of_last_user_per_task'][] = (isset($lastUserAssignment[max(array_keys($lastUserAssignment))]['userId'])) ? $lastUserAssignment[max(array_keys($lastUserAssignment))]['userId'] : '-';
                    //get all task of project by phase;
                    $this->setTaskPhase($task, $project);
                    $this->defaultKpi['labeling_phase'][] = ($this->taskPhase) ? $this->taskPhase : '-';
                    $this->defaultKpi['export_time'][] = $exportTime;
                    $this->defaultKpi['UUID_of_user'][] = $project->getUserId();
                    /*Task time counter*/
                    $taskTime = $this->taskTimerFacadeFactory->getFacadeByProjectIdAndTaskId(
                        $project->getId(),
                        $task->getId()
                    );
                    $taskTimeIterator = new TotalTaskTime($task, $project->getUserId(), $taskTime);
                    $totalTaskTime = 0;
                    foreach ($taskTimeIterator as $topTime) {
                        $time = (int)$topTime->getTimeInSeconds($this->taskPhase);
                        $totalTaskTime += $time;
                    }
                    $this->defaultKpi['task_loading_time'][] = $totalTaskTime;
                    $this->defaultKpi['user_label_task_net_time'][] = $totalTaskTime;
                    $this->defaultKpi['user_review_task_net_time'][] = $totalTaskTime;
                    $this->defaultKpi['user_revision_task_net_time'][] = $totalTaskTime;
                    //add kpi object to csv array data
                    $this->setKpiObject($task, $project);
                    //add kpi boxes to csv array data
                    $this->setKpiBoxes($task, $project);
                    //add kpi attributes to csv array data
                    $this->setKpiAttributes($task, $project);
                };
                $filename = sprintf(
                    'export_%s_%s.csv',
                    $project->getName(),
                    '_labelteam_KPI'
                );
                $this->defaultKpi['Exporter_name'] = [$filename];

                //convert array to needed format
                $dataForCsv = $this->csvToExportFormat();
                //prepare csv data
                $this->createCsv($dataForCsv);
                //save csv to couchDB
                $this->saveExportModel($export, $filename);
            } else {
                $export->setStatus(Export::EXPORT_STATUS_ERROR);
                $this->exporterFacade->save($export);
            }
        } catch (\Exception $exception) {
            $export->setStatus(Export::EXPORT_STATUS_ERROR);
            $this->exporterFacade->save($export);

            throw $exception;
        }
    }

    /**
     * @param LabelingTask $task
     * @param \AppBundle\Model\Project $project
     */
    private function setTaskPhase(LabelingTask $task, \AppBundle\Model\Project $project)
    {
        $allProjectPhaseTask = $this->taskService->getTaskByPhase($project->getId());
        if (is_array($allProjectPhaseTask)) {
            foreach ($allProjectPhaseTask as $phaseName => $phaseTasks) {
                if (in_array($task->getId(), $phaseTasks)) {
                    $this->taskPhase = $phaseName;
                }
                //get tasks per phase
                switch ($phaseName) {
                    case 'labeling':
                        $this->labelTasks = $phaseTasks;
                        break;
                    case 'review':
                        $this->reviewTasks = $phaseTasks;
                        break;
                    case 'revision':
                        $this->revisionTasks = $phaseTasks;
                        break;
                }
            }
        }
    }

    /**
     * @param LabelingTask $task
     * @param \AppBundle\Model\Project $project
     */
    private function setKpiObject(LabelingTask $task, \AppBundle\Model\Project $project)
    {
        //OBJECT
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $project->getId(),
            $task->getId()
        );
        $userCreateThingIterator = new LabeledThingCreateByUser(
            $task,
            $project->getUserId(),
            $labeledThingFacade
        );
        //variable to get total_objects_created_per_user_per_task_all_phases ->
        $labelThingsCreatedAllPhase = 0;
        foreach ($userCreateThingIterator as $thing) {
            if ($thing) {
                $labelThingsCreatedAllPhase++;
            }
        }
        $this->defaultKpi['total_objects_created_per_user_per_task_all_phases'] = [$labelThingsCreatedAllPhase];

        $userModifyThingIterator = new LabeledThingModifyByUser(
            $task,
            $project->getUserId(),
            $labeledThingFacade
        );
        $labelThingsModifyAllPhase = 0;
        foreach ($userModifyThingIterator as $thing) {
            if ($thing) {
                $labelThingsModifyAllPhase++;
            }
        }
        $this->defaultKpi['total_objects_modified_per_user_per_task_all_phases'] = [$labelThingsModifyAllPhase];

        //object in labeling phase
        $thingsInLabeledPhaseCreate = 0;
        $thingsInLabeledPhaseModify = 0;
        if (!empty($this->labelTasks)) {
            foreach ($this->labelTasks as $taskId) {
                //loop all task thing in "labeling" phase
                $task = $this->labelingTask->find($taskId);
                //get count create by user
                $userCreateThingLabelingPhaseIterator = new PhaseThingCreateByUser(
                    $task,
                    $project->getUserId(),
                    $labeledThingFacade
                );
                foreach ($userCreateThingLabelingPhaseIterator as $thing) {
                    if ($thing) {
                        $this->userCreateLabelThingsIds[] = $thing->getId();
                        $thingsInLabeledPhaseCreate++;
                    }
                }
                //get count modify by user
                $userModifyThingLabelingPhaseIterator = new PhaseThingModifyByUser(
                    $task,
                    $project->getUserId(),
                    $labeledThingFacade
                );
                foreach ($userModifyThingLabelingPhaseIterator as $thing) {
                    if ($thing) {
                        $thingsInLabeledPhaseModify++;
                    }
                }

            }
        }
        //create object
        $this->defaultKpi['total_objects_created_per_user_per_task_labeling'] = [$thingsInLabeledPhaseCreate];
        //modify object
        $this->defaultKpi['total_objects_modified_per_user_per_task_labeling'] = [$thingsInLabeledPhaseModify];

        //review phase
        $thingsInReviewPhaseCreate = 0;
        $thingsInReviewPhaseModify = 0;
        if (!empty($this->reviewTasks)) {
            foreach ($this->reviewTasks as $taskId) {
                //loop all task thing (object) in "review" phase
                $task = $this->labelingTask->find($taskId);
                //get count create by user
                $userCreateThingReviewPhaseIterator = new PhaseThingCreateByUser(
                    $task,
                    $project->getUserId(),
                    $labeledThingFacade
                );
                foreach ($userCreateThingReviewPhaseIterator as $thing) {
                    if ($thing) {
                        $this->userCreateReviewThingsIds[] = $thing->getId();
                        $thingsInReviewPhaseCreate++;
                    }
                }
                //get count modify by user
                $userModifyThingReviewPhaseIterator = new PhaseThingModifyByUser(
                    $task,
                    $project->getUserId(),
                    $labeledThingFacade
                );
                foreach ($userModifyThingReviewPhaseIterator as $thing) {
                    if ($thing) {
                        $this->userModifyReviewThingsIds[] = $thing->getId();
                        $thingsInReviewPhaseModify++;
                    }
                }
            }
        }
        //create object
        $this->defaultKpi['total_objects_created_per_user_per_task_review'] = [$thingsInReviewPhaseCreate];
        //modify object
        $this->defaultKpi['total_objects_modified_per_user_per_task_review'] = [$thingsInReviewPhaseModify];

        //object in revision phase
        $thingsInRevisionPhaseCreate = 0;
        $thingsInRevisionPhaseModify = 0;
        if (!empty($this->revisionTasks)) {
            foreach ($this->revisionTasks as $taskId) {
                //loop all task thing (object) in "revision" phase
                $revTask = $this->labelingTask->find($taskId);
                //get count create by user
                $userCreateThingRevisionPhaseIterator = new PhaseThingCreateByUser(
                    $revTask,
                    $project->getUserId(),
                    $labeledThingFacade
                );
                foreach ($userCreateThingRevisionPhaseIterator as $thing) {
                    if ($thing) {
                        $this->userCreateRevisionThingsIds[] = $thing->getId();
                        $thingsInRevisionPhaseCreate++;
                    }
                }
                //get count modify by user
                $userModifyThingRevisionPhaseIterator = new PhaseThingModifyByUser(
                    $revTask,
                    $project->getUserId(),
                    $labeledThingFacade
                );
                foreach ($userModifyThingRevisionPhaseIterator as $thing) {
                    if ($thing) {
                        $this->userModifyRevisionThingsIds[] = $thing->getId();
                        $thingsInRevisionPhaseModify++;
                    }
                }
            }
        }
        //object create
        $this->defaultKpi['total_objects_created_per_user_per_task_revision'] = [$thingsInRevisionPhaseCreate];

        //object modify
        $this->defaultKpi['total_objects_modified_per_user_per_task_revision'] = [$thingsInRevisionPhaseModify];
    }

    /**
     * @param LabelingTask $task
     * @param \AppBundle\Model\Project $project
     */
    private function setKpiBoxes(LabelingTask $task, \AppBundle\Model\Project $project)
    {
        //BOXES labelingThingInFrame
        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $project->getId(),
            $task->getId()
        );
        //labeling phase
        $boxesInLabeledPhaseCreate = 0;
        if (!empty($this->labelTasks)) {
            foreach ($this->labelTasks as $taskId) {
                //loop all task thing in "labeling" phase
                $labTask = $this->labelingTask->find($taskId);
                //get BOXES created by user
                $createThingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $labTask
                );
                foreach ($createThingInFrameLabelingPhaseIterator as $thingInFrame) {
                    // check if box create by needed object
                    if (in_array($thingInFrame->getLabeledThingId(), $this->userCreateLabelThingsIds)) {
                        $boxesInLabeledPhaseCreate++;
                    }
                }
            }
        }
        //object create
        $this->defaultKpi['total_object_frames_set_per_user_per_task_in_labeling'] = [$boxesInLabeledPhaseCreate];

        //review phase
        $boxesInReviewPhaseCreate = 0;
        $boxesInReviewPhaseModify = 0;
        //task in "review" phase
        if (!empty($this->reviewTasks)) {
            foreach ($this->reviewTasks as $taskId) {
                //loop all task thing in "review" phase
                $boxRevTask = $this->labelingTask->find($taskId);
                //get boxes by task
                $createThingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $boxRevTask
                );
                foreach ($createThingInFrameLabelingPhaseIterator as $thingInFrame) {
                    // check if box create by needed object and user
                    if (in_array($thingInFrame->getLabeledThingId(), $this->userCreateReviewThingsIds)) {
                        $boxesInReviewPhaseCreate++;
                    }
                    // check if box modify by needed object and user
                    if (in_array($thingInFrame->getLabeledThingId(), $this->userModifyReviewThingsIds)) {
                        $boxesInReviewPhaseCreate++;
                    }
                }
            }
        }
        //boxes create
        $this->defaultKpi['total_objects_frames_created_per_user_in_review'] = [$boxesInReviewPhaseCreate];
        //boxes modify
        $this->defaultKpi['total_objects_frames_modified_per_user_in_review'] = [$boxesInReviewPhaseModify];

        //revision phase
        $boxesInRevisionPhaseCreate = 0;
        $boxesInRevisionPhaseModify = 0;
        if (!empty($this->revisionTasks)) {
            foreach ($this->revisionTasks as $taskId) {
                //loop all task thing in "revision" phase
                $boxRevTask = $this->labelingTask->find($taskId);
                //get boxes by task
                $createThingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $boxRevTask
                );
                foreach ($createThingInFrameLabelingPhaseIterator as $thingInFrame) {
                    // check if box create by needed object and user
                    if (in_array($thingInFrame->getLabeledThingId(), $this->userCreateRevisionThingsIds)) {
                        $boxesInRevisionPhaseCreate++;
                    }
                    // check if box modify by needed object and user
                    if (in_array($thingInFrame->getLabeledThingId(), $this->userModifyRevisionThingsIds)) {
                        $boxesInRevisionPhaseModify++;
                    }
                }
            }
        }
        //boxes create
        $this->defaultKpi['total_objects_frames_created_per_user_in_revision'] = [$boxesInRevisionPhaseCreate];
        //boxes modify
        $this->defaultKpi['total_objects_frames_modified_per_user_in_revision'] = [$boxesInRevisionPhaseModify];

        $userModifyInRevisionReview = $boxesInRevisionPhaseModify + $boxesInReviewPhaseModify;
        $this->defaultKpi['total_object_frames_modified_per_user_per_task'] = [$userModifyInRevisionReview];

        $totalBoxInTask = 0;
        $allThingInFrameIterator = new PhaseThingInFrameByUser(
            $labeledThingInFrameFacade,
            $task
        );
        foreach ($allThingInFrameIterator as $taskBox) {
            if ($taskBox) {
                $totalBoxInTask++;
            }
        }
        $this->defaultKpi['total_object_frames_currently_per_task'] = [$totalBoxInTask];
    }

    /**
     * @param LabelingTask $task
     * @param \AppBundle\Model\Project $project
     */
    private function setKpiAttributes(LabelingTask $task, \AppBundle\Model\Project $project)
    {
        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $project->getId(),
            $task->getId()
        );
        //Attributes
        $totalSelectAttr = 0;
        $allThingInFrameAllPhaseIterator = new PhaseThingInFrameByUser(
            $labeledThingInFrameFacade,
            $task
        );
        foreach ($allThingInFrameAllPhaseIterator as $thingInFrame) {
            if ($thingInFrame) {
                if ($thingInFrame->getClasses()) {
                    $totalSelectAttr += count($thingInFrame->getClasses());
                }
            }
        }
        $this->defaultKpi['total_attributes_currently_set_per_task'] = [$totalSelectAttr];

        //labeling phase
        $totalSelectAttrLabel = 0;
        if (!empty($this->labelTasks)) {
            foreach ($this->labelTasks as $taskId) {
                //loop all task thing in "labeling" phase
                $attrLabTask = $this->labelingTask->find($taskId);
                //get thing in frame by task
                $thingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $attrLabTask
                );
                //each all thing in frame
                foreach ($thingInFrameLabelingPhaseIterator as $thingInFrame) {
                    // get box attribute
                    if ($thingInFrame) {
                        if ($thingInFrame->getClasses()) {
                            $totalSelectAttrLabel += count($thingInFrame->getClasses());
                        }
                    }
                }
            }
        }
        $this->defaultKpi['total_attributes_set_per_task_in_labeling'] = [$totalSelectAttrLabel];

        //review phase
        $totalSelectAttrReview = 0;
        if (!empty($this->reviewTasks)) {
            foreach ($this->reviewTasks as $taskId) {
                //loop all task thing in "review" phase
                $attrRevTask = $this->labelingTask->find($taskId);
                //get labeling thing in frame by task
                $thingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $attrRevTask
                );
                //each all thing in frame
                foreach ($thingInFrameLabelingPhaseIterator as $thingInFrame) {
                    // get box attribute
                    if ($thingInFrame) {
                        if ($thingInFrame->getClasses()) {
                            $totalSelectAttrReview += count($thingInFrame->getClasses());
                        }
                    }
                }
            }
        }

        $this->defaultKpi['total_changed_attributes_per_task_review'] = [$totalSelectAttrReview];

        //revision phase
        $totalSelectAttrRevision = 0;
        if (!empty($this->revisionTasks)) {
            foreach ($this->revisionTasks as $taskId) {
                //loop all task thing in "revision" phase
                $attrRevisionTask = $this->labelingTask->find($taskId);
                //get labeling thin in frame by task
                $thingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $attrRevisionTask
                );
                //each all thing in frame
                foreach ($thingInFrameLabelingPhaseIterator as $thingInFrame) {
                    // get box attribute
                    if ($thingInFrame) {
                        if ($thingInFrame->getClasses()) {
                            $totalSelectAttrRevision += count($thingInFrame->getClasses());
                        }
                    }
                }
            }
        }
        $this->defaultKpi['total_changed_attributes_per_task_revision'] = [$totalSelectAttrRevision];
    }

    //convert data to correct kpi csv format
    private function csvToExportFormat()
    {
        $maxArray = 0;
        $maxKey = '';
        foreach ($this->defaultKpi as $key => $t) {
            if(count($t) >= $maxArray) {
                $maxArray = count($t);
                $maxKey = $key;
            }
        }
        $fields = [];
        foreach ($this->defaultKpi as $key => $ad) {
            $fields[$key] = [];
            $lastElementValue = end($this->defaultKpi[$key]);
            $elementDiff = $maxArray-count($ad);
            if($elementDiff > 0) {
                for ($i = 0; $i < $maxArray - count($ad); $i++) {
                    if ($key != $maxKey) {
                        array_push($this->defaultKpi[$key], $lastElementValue);
                    }
                }
            }
        }

        $dataForCsv = [];
        for ($csvCounter =0; $csvCounter < $maxArray; $csvCounter++) {
            foreach ($this->defaultKpi as $field => $value) {
                $dataForCsv[$csvCounter][$field] = $value[$csvCounter];
            }
        }

        return $dataForCsv;
    }

    private function saveExportModel(Export $export, string $filename)
    {
        $zipData[$filename] = $this->csv;
        $zipContent = $this->compressData($zipData);
        $date       = new \DateTime('now', new \DateTimeZone('UTC'));
        $filename   = sprintf('export_%s.zip', $date->format('Y-m-d-H-i-s'));
        $export->addAttachment($filename, $zipContent, 'application/zip');
        $export->setStatus(Export::EXPORT_STATUS_DONE);

        $this->exporterFacade->save($export);
    }

    private function createCsv(array $data)
    {
        $output = fopen('php://temp', 'w');
        fputcsv($output, [
            'UUID_of_the_project',
            'UUID_of_the_task',
            'UUID_of_last_user_per_task',
            'labeling_phase',
            'export_time',
            'UUID_of_user',
            'task_loading_time',
            'user_label_task_net_time',
            'user_review_task_net_time',
            'user_revision_task_net_time',
            'total_objects_created_per_user_per_task_all_phases',
            'total_objects_modified_per_user_per_task_all_phases',
            'total_objects_created_per_user_per_task_labeling',
            'total_objects_modified_per_user_per_task_labeling',
            'total_objects_created_per_user_per_task_review',
            'total_objects_modified_per_user_per_task_review',
            'total_objects_created_per_user_per_task_revision',
            'total_objects_modified_per_user_per_task_revision',
            'total_object_frames_set_per_user_per_task_in_labeling',
            'total_objects_frames_created_per_user_in_review',
            'total_objects_frames_modified_per_user_in_review',
            'total_objects_frames_created_per_user_in_revision',
            'total_objects_frames_modified_per_user_in_revision',
            'total_object_frames_modified_per_user_per_task',
            'total_object_frames_currently_per_task',
            'total_attributes_currently_set_per_task',
            'total_attributes_set_per_task_in_labeling',
            'total_changed_attributes_per_task_review',
            'total_changed_attributes_per_task_revision',
            'Exporter_name'
        ],',');

        foreach ($data as $row) {
            fputcsv($output,
                [
                    $row['UUID_of_the_project'],
                    $row['UUID_of_the_task'],
                    $row['UUID_of_last_user_per_task'],
                    $row['labeling_phase'],
                    $row['export_time'],
                    $row['UUID_of_user'],
                    $row['task_loading_time'],
                    $row['user_label_task_net_time'],
                    $row['user_review_task_net_time'],
                    $row['user_revision_task_net_time'],
                    $row['total_objects_created_per_user_per_task_all_phases'],
                    $row['total_objects_modified_per_user_per_task_all_phases'],
                    $row['total_objects_created_per_user_per_task_labeling'],
                    $row['total_objects_modified_per_user_per_task_labeling'],
                    $row['total_objects_created_per_user_per_task_review'],
                    $row['total_objects_modified_per_user_per_task_review'],
                    $row['total_objects_created_per_user_per_task_revision'],
                    $row['total_objects_modified_per_user_per_task_revision'],
                    $row['total_object_frames_set_per_user_per_task_in_labeling'],
                    $row['total_objects_frames_created_per_user_in_review'],
                    $row['total_objects_frames_modified_per_user_in_review'],
                    $row['total_objects_frames_created_per_user_in_revision'],
                    $row['total_objects_frames_modified_per_user_in_revision'],
                    $row['total_object_frames_modified_per_user_per_task'],
                    $row['total_object_frames_currently_per_task'],
                    $row['total_attributes_currently_set_per_task'],
                    $row['total_attributes_set_per_task_in_labeling'],
                    $row['total_changed_attributes_per_task_review'],
                    $row['total_changed_attributes_per_task_revision'],
                    $row['Exporter_name']
                ], ',');
        }

        rewind($output);
        $this->csv = '';
        while ($line = fgets($output)) {
            $this->csv .= $line;
        }

        $this->csv .= fgets($output);
    }

    /**
     * @param array $data
     * @return bool|string
     * @throws \Exception
     */
    private function compressData(array $data)
    {
        $zipFilename = tempnam(sys_get_temp_dir(), 'anno-export-csv-');

        $zip = new \ZipArchive();
        if ($zip->open($zipFilename, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            throw new \Exception(sprintf('Unable to open zip archive at "%s"', $zipFilename));
        }

        if (empty($files)) {
            $zip->addEmptyDir('.');
        }
        foreach ($data as $filename => $value) {
            $zip->addFromString($filename, $value);
        }

        $zip->close();

        return file_get_contents($zipFilename);
    }
}
