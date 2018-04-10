<?php

namespace AnnoStationBundle\Service;


use AnnoStationBundle\Database\Facade\Project;

class KpiExport
{

    /**
     * @var Project
     */
    private $projectFacade;

    public function __construct
    (
        Project $projectFacade
    )
    {
        $this->projectFacade        = $projectFacade;
    }


    public function build($projectId)
    {
        $project = $this->projectFacade->find($projectId);
        $projectTask = $this->projectFacade->getTasksByProject($project);
        return $projectTask;



        $defaultKpi = [];

        //1
        $defaultKpi['UUID_of_the_project'] = [$project->getId()];




        //$defaultKpi['UUID_of_the_task'] = [];
        if($projectTask) {
            $exportTime = date('d/m/Y h:m:s');
            foreach ($projectTask as $task) {
                //2
                $defaultKpi['UUID_of_the_task'][] = $task->getId();

                $lastUserAssignment = $task->getAssignmentHistory();
                //3
                $defaultKpi['UUID_of_last_user_per_task'][] = (isset($lastUserAssignment[max(array_keys($lastUserAssignment))]['userId'])) ? $lastUserAssignment[max(array_keys($lastUserAssignment))]['userId'] : '-' ;

                //4
                $defaultKpi['labeling_phase'][] = (isset($lastUserAssignment[max(array_keys($lastUserAssignment))]['phase'])) ? $lastUserAssignment[max(array_keys($lastUserAssignment))]['phase'] : '-' ;

                //5
                $defaultKpi['export_time'][] = $exportTime;

                //6
                $defaultKpi['UUID_of_user'][] = $project->getUserId();

                //7
                $defaultKpi['task_loading_time'][] = time();

                //8
                $defaultKpi['user_label_task_net_time'][] = time();

                //9
                $defaultKpi['user_review_task_net_time'][] = time();

                //10
                $defaultKpi['user_revision_task_net_time'][] = time();

            };
        }

        $defaultKpi['total_objects_created_per_user_per_task_all_phases'] = ['d'];





        $maxArray = 0;
        $maxKey = '';
        foreach ($defaultKpi as $k => $t) {
            if(count($t) >= $maxArray) {
                $maxArray = count($t);
                $maxKey = $k;
            }
        }
        $fields = [];
        foreach ($defaultKpi as $k => $ad) {
            $fields[$k] = [];
            $lastElementValue = end($defaultKpi[$k]);
            $elementDiff = $maxArray-count($ad);
            if($elementDiff > 0) {
                for ($i = 0; $i < $maxArray - count($ad); $i++) {
                    if ($k != $maxKey) {
                        array_push($defaultKpi[$k], $lastElementValue);
                    }
                }
            }
        }

        $dataForCsv = [];
        $i = 0;
        for ($ii =0; $ii < $maxArray; $ii++) {
            foreach ($defaultKpi as $k => $t) {
                $dataForCsv[$ii][$k] = $t[$ii];
                $i++;
            }
        }

        return $dataForCsv;
    }
}
