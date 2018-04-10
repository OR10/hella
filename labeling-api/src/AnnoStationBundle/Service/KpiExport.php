<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade\Project;
use AnnoStationBundle\Helper\Iterator\LabeledThing;
use AnnoStationBundle\Helper\Iterator\LabelingTask;

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
     * @var array
     */
    private $defaultKpi = [];

    public function __construct
    (
        Project $projectFacade,
        \AnnoStationBundle\Database\Facade\LabelingTask $labelingTask,
        $labelingThingFactory,
        $taskService
    )
    {
        $this->projectFacade             = $projectFacade;
        $this->labelingTask              = $labelingTask;
        $this->labeledThingFacadeFactory = $labelingThingFactory;
        $this->taskService               = $taskService;

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
                $allPhaseTask = $this->taskService->getTaskByPhase($project->getId());
                $taskPhase= '';
                foreach ($allPhaseTask as $phaseName => $phaseTasks) {
                    if(in_array($task->getId(), $phaseTasks)) {
                        $taskPhase = $phaseName;
                    }
                }
                $this->defaultKpi['labeling_phase'][] = $taskPhase;//(isset($lastUserAssignment[max(array_keys($lastUserAssignment))]['phase'])) ? $lastUserAssignment[max(array_keys($lastUserAssignment))]['phase'] : '-' ;

                //5
                $this->defaultKpi['export_time'][] = $exportTime;

                //6
                $this->defaultKpi['UUID_of_user'][] = $project->getUserId();

                //7
                $this->defaultKpi['task_loading_time'][] = time();

                //8
                $this->defaultKpi['user_label_task_net_time'][] = time();

                //9
                $this->defaultKpi['user_review_task_net_time'][] = time();

                //10
                $this->defaultKpi['user_revision_task_net_time'][] = time();



                //11

                //get all total_objects_created_per_user_per_task_all_phases ->
                $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
                    $project->getId(),
                    $task->getId()
                );
                $labeledThingIterator = new LabeledThing(
                    $task,
                    $labeledThingFacade
                );
                //variable to get total_objects_created_per_user_per_task_all_phases ->
                $labelThingsCreatedAllPhase = 0;
                foreach ($labeledThingIterator as $thing) {
                    //$labelThingsCreatedAllPhase[] = $thing->getId();
                    $labelThingsCreatedAllPhase ++;
                }
                $this->defaultKpi['total_objects_created_per_user_per_task_all_phases'] = [$labelThingsCreatedAllPhase];


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
