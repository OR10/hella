<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade\Project;
use AnnoStationBundle\Helper\Iterator\LabeledThingCreateByUser;
use AnnoStationBundle\Helper\Iterator\LabeledThingModifyByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingCreateByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingModifyByUser;
use AnnoStationBundle\Helper\Iterator\TotalTaskTime;

class KpiExport
{
    /**
     * @var Project
     */
    private $projectFacade;

    /**
     * @var
     */
    private $labelingTask;

    /**
     * @var
     */
    private $labeledThingFacadeFactory;

    /**
     * @var
     */
    private $taskService;

    /**
     * @var
     */
    private $taskTimerFacadeFactory;

    /**
     * @var array
     */
    private $labelTasks = [];

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

    public function __construct
    (
        Project $projectFacade,
        \AnnoStationBundle\Database\Facade\LabelingTask $labelingTask,
        $labelingThingFactory,
        $taskService,
        $taskTimerFactory
    )
    {
        $this->projectFacade             = $projectFacade;
        $this->labelingTask              = $labelingTask;
        $this->labeledThingFacadeFactory = $labelingThingFactory;
        $this->taskService               = $taskService;
        $this->taskTimerFacadeFactory    = $taskTimerFactory;
    }


    public function build($projectId)
    {
        $project = $this->projectFacade->find($projectId);
        $projectTask = $this->projectFacade->getTasksByProject($project);



        //1
        $this->defaultKpi['UUID_of_the_project'] = [$project->getId()];




        //$defaultKpi['UUID_of_the_task'] = [];
        if($projectTask) {







            $exportTime = date('d/m/Y h:m:s');

            foreach ($projectTask as $task) {





                //2
                $this->defaultKpi['UUID_of_the_task'][] = $task->getId();

                $lastUserAssignment = $task->getAssignmentHistory();
                //3
                $this->defaultKpi['UUID_of_last_user_per_task'][] = (isset($lastUserAssignment[max(array_keys($lastUserAssignment))]['userId'])) ? $lastUserAssignment[max(array_keys($lastUserAssignment))]['userId'] : '-' ;

                //4
                //get all task of project by phase;
                $allProjectPhaseTask = $this->taskService->getTaskByPhase($project->getId());
                $taskPhase= '';

                foreach ($allProjectPhaseTask as $phaseName => $phaseTasks) {
                    if(in_array($task->getId(), $phaseTasks)) {
                        $taskPhase = $phaseName;
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
                $this->defaultKpi['labeling_phase'][] = ($taskPhase) ? $taskPhase : '-';//(isset($lastUserAssignment[max(array_keys($lastUserAssignment))]['phase'])) ? $lastUserAssignment[max(array_keys($lastUserAssignment))]['phase'] : '-' ;

                //5
                $this->defaultKpi['export_time'][] = $exportTime;

                //6
                $this->defaultKpi['UUID_of_user'][] = $project->getUserId();




                /*Task time counter*/
                $taskTime = $this->taskTimerFacadeFactory->getFacadeByProjectIdAndTaskId(
                    $project->getId(),
                    $task->getId()
                );
                $taskTimeIterator = new TotalTaskTime($task, $project->getUserId(), $taskTime);
                $totalTaskTime = 0;
                foreach ($taskTimeIterator as $topTime) {
                    $time = (int)$topTime->getTimeInSeconds($taskPhase);
                    $totalTaskTime += $time;
                }

                //7
                $this->defaultKpi['task_loading_time'][] = $totalTaskTime;

                //8
                $this->defaultKpi['user_label_task_net_time'][] = $totalTaskTime;

                //9
                $this->defaultKpi['user_review_task_net_time'][] = $totalTaskTime;

                //10
                $this->defaultKpi['user_revision_task_net_time'][] = $totalTaskTime;





                //11  OBJECT

                //get all total_objects_created_per_user_per_task_all_phases ->
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
                    if($thing) {
                        $labelThingsCreatedAllPhase++;
                    }
                }
                $this->defaultKpi['total_objects_created_per_user_per_task_all_phases'] = [$labelThingsCreatedAllPhase];


                //12

                //'total_objects_modified_per_user_per_task_all_phases'
                $userModifyThingIterator = new LabeledThingModifyByUser(
                    $task,
                    $project->getUserId(),
                    $labeledThingFacade
                );
                $labelThingsModifyAllPhase = 0;
                foreach ($userModifyThingIterator as $thing) {
                    if($thing) {
                        $labelThingsModifyAllPhase++;
                    }
                }

                $this->defaultKpi['total_objects_modified_per_user_per_task_all_phases'] = [$labelThingsModifyAllPhase];



                //13 labeling
                //all task in labeled phase
                $thingsInLabeledPhaseCreate = 0;
                $thingsInLabeledPhaseModify = 0;
                if(!empty($this->labelTasks)) {
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
                //total_objects_created_per_user_per_task_labeling
                $this->defaultKpi['total_objects_created_per_user_per_task_labeling'] = [$thingsInLabeledPhaseCreate];

                //14
                //all task in labeled phase
                $this->defaultKpi['total_objects_modified_per_user_per_task_labeling'] = [$thingsInLabeledPhaseModify];




                //15 review phase
                $thingsInReviewPhaseCreate = 0;
                $thingsInReviewPhaseModify = 0;

                if(!empty($this->reviewTasks)) {
                    foreach ($this->reviewTasks as $taskId) {
                        //loop all task thing in "review" phase
                        $task = $this->labelingTask->find($taskId);
                        //get count create by user
                        $userCreateThingReviewPhaseIterator = new PhaseThingCreateByUser(
                            $task,
                            $project->getUserId(),
                            $labeledThingFacade
                        );
                        foreach ($userCreateThingReviewPhaseIterator as $thing) {
                            if ($thing) {
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
                                $thingsInReviewPhaseModify++;
                            }
                        }

                    }
                }
                $this->defaultKpi['total_objects_created_per_user_per_task_review'] = [$thingsInReviewPhaseCreate];


                //16
                $this->defaultKpi['total_objects_modified_per_user_per_task_review'] = [$thingsInReviewPhaseModify];


                //17 revision
                $thingsInRevisionPhaseCreate = 0;
                $thingsInRevisionPhaseModify = 0;

                if(!empty($this->revisionTasks)) {
                    foreach ($this->revisionTasks as $taskId) {
                        //loop all task thing in "review" phase
                        $task = $this->labelingTask->find($taskId);
                        //get count create by user
                        $userCreateThingRevisionPhaseIterator = new PhaseThingCreateByUser(
                            $task,
                            $project->getUserId(),
                            $labeledThingFacade
                        );
                        foreach ($userCreateThingRevisionPhaseIterator as $thing) {
                            if ($thing) {
                                $thingsInRevisionPhaseCreate++;
                            }
                        }
                        //get count modify by user
                        $userModifyThingRevisionPhaseIterator = new PhaseThingModifyByUser(
                            $task,
                            $project->getUserId(),
                            $labeledThingFacade
                        );
                        foreach ($userModifyThingRevisionPhaseIterator as $thing) {
                            if ($thing) {
                                $thingsInRevisionPhaseModify++;
                            }
                        }

                    }
                }
                $this->defaultKpi['total_objects_created_per_user_per_task_revision'] = [$thingsInRevisionPhaseCreate];


                //18
                $this->defaultKpi['total_objects_modified_per_user_per_task_revision'] = [$thingsInRevisionPhaseModify];

                //BOXES labelingThingInFrame




            };
        }

        /*
           $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
                        $project->getId(),
                        $task->getId()
                    );

            $labeledThingIterator = new Iterator\LabeledThing(
                        $task,
                        $labeledThingFacade
                    );

            foreach($labeledThingIterator)


         */











        $maxArray = 0;
        $maxKey = '';
        foreach ($this->defaultKpi as $k => $t) {
            if(count($t) >= $maxArray) {
                $maxArray = count($t);
                $maxKey = $k;
            }
        }
        $fields = [];
        foreach ($this->defaultKpi as $k => $ad) {
            $fields[$k] = [];
            $lastElementValue = end($this->defaultKpi[$k]);
            $elementDiff = $maxArray-count($ad);
            if($elementDiff > 0) {
                for ($i = 0; $i < $maxArray - count($ad); $i++) {
                    if ($k != $maxKey) {
                        array_push($this->defaultKpi[$k], $lastElementValue);
                    }
                }
            }
        }

        $dataForCsv = [];
        $i = 0;
        for ($ii =0; $ii < $maxArray; $ii++) {
            foreach ($this->defaultKpi as $k => $t) {
                $dataForCsv[$ii][$k] = $t[$ii];
                $i++;
            }
        }

        return $dataForCsv;
    }
}
