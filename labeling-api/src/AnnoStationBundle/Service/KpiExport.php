<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade\Exporter;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AnnoStationBundle\Database\Facade\Project;
use AnnoStationBundle\Helper\Iterator\LabeledThing;
use AnnoStationBundle\Helper\Iterator\LabeledThingCreateByUser;
use AnnoStationBundle\Helper\Iterator\LabeledThingModifyByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingCreateByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingInFrameByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingInFrameCreateByUser;
use AnnoStationBundle\Helper\Iterator\PhaseThingModifyByUser;
use AnnoStationBundle\Helper\Iterator\TotalTaskTime;
use AppBundle\Model\Export;

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
    private $csv;

    /**
     * @var
     */
    private $labeledThingFacadeFactory;

    /**
     * @var
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var
     */
    private $taskService;

    /**
     * @var
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
        $taskTimerFactory,
        $labelingThingInFrame,
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
                $userCreateLabelThingsIds = [];
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
                                $userCreateLabelThingsIds[] = $thing->getId();
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
                $userCreateReviewThingsIds = [];
                $userModifyReviewThingsIds = [];
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
                                $userCreateReviewThingsIds[] = $thing->getId();
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
                                $userModifyReviewThingsIds[] = $thing->getId();
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
                $userCreateRevisionThingsIds = [];
                $userModifyRevisionThingsIds = [];
                if(!empty($this->revisionTasks)) {
                    foreach ($this->revisionTasks as $taskId) {
                        //loop all task thing in "review" phase
                        $revTask = $this->labelingTask->find($taskId);
                        //get count create by user
                        $userCreateThingRevisionPhaseIterator = new PhaseThingCreateByUser(
                            $revTask,
                            $project->getUserId(),
                            $labeledThingFacade
                        );
                        foreach ($userCreateThingRevisionPhaseIterator as $thing) {
                            if ($thing) {
                                $userCreateRevisionThingsIds[] = $thing->getId();
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
                                $userModifyRevisionThingsIds[] = $thing->getId();
                                $thingsInRevisionPhaseModify++;
                            }
                        }

                    }
                }
                $this->defaultKpi['total_objects_created_per_user_per_task_revision'] = [$thingsInRevisionPhaseCreate];


                //18
                $this->defaultKpi['total_objects_modified_per_user_per_task_revision'] = [$thingsInRevisionPhaseModify];





                //BOXES labelingThingInFrame


                //19 | real 17
                $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                    $project->getId(),
                    $task->getId()
                );

                $boxesInLabeledPhaseCreate = 0;
                //task ib "labeling" phase
                if(!empty($this->labelTasks)) {
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
                            if(in_array($thingInFrame->getLabeledThingId(), $userCreateLabelThingsIds)) {
                                $boxesInLabeledPhaseCreate++;
                            }
                        }
                    }
                }

                $this->defaultKpi['total_object_frames_set_per_user_per_task_in_labeling'] = [$boxesInLabeledPhaseCreate];


                //20 | real 18 review phase

                $boxesInReviewPhaseCreate = 0;
                $boxesInReviewPhaseModify = 0;
                //task ib "review" phase
                if(!empty($this->reviewTasks)) {
                    foreach ($this->reviewTasks as $taskId) {
                        //loop all task thing in "labeling" phase
                        $boxRevTask = $this->labelingTask->find($taskId);

                        //get BOXES by task
                        $createThingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                            $labeledThingInFrameFacade,
                            $boxRevTask
                        );

                        foreach ($createThingInFrameLabelingPhaseIterator as $thingInFrame) {
                            // check if box create by needed object and user
                            if(in_array($thingInFrame->getLabeledThingId(), $userCreateReviewThingsIds)) {
                                $boxesInReviewPhaseCreate++;
                            }
                            // check if box modify by needed object and user
                            if(in_array($thingInFrame->getLabeledThingId(), $userModifyReviewThingsIds)) {
                                $boxesInReviewPhaseCreate++;
                            }
                        }
                    }
                }
                $this->defaultKpi['total_objects_frames_created_per_user_in_review'] = [$boxesInReviewPhaseCreate];


                //21

                $this->defaultKpi['total_objects_frames_modified_per_user_in_review'] = [$boxesInReviewPhaseModify];



                //22 | real 19 revision phase

                $boxesInRevisionPhaseCreate = 0;
                $boxesInRevisionPhaseModify = 0;
                //task ib "review" phase
                if(!empty($this->revisionTasks)) {
                    foreach ($this->revisionTasks as $taskId) {
                        //loop all task thing in "labeling" phase
                        $boxRevTask = $this->labelingTask->find($taskId);

                        //get BOXES by task
                        $createThingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                            $labeledThingInFrameFacade,
                            $boxRevTask
                        );

                        foreach ($createThingInFrameLabelingPhaseIterator as $thingInFrame) {
                            // check if box create by needed object and user
                            if(in_array($thingInFrame->getLabeledThingId(), $userCreateRevisionThingsIds)) {
                                $boxesInRevisionPhaseCreate++;
                            }
                            // check if box modify by needed object and user
                            if(in_array($thingInFrame->getLabeledThingId(), $userModifyRevisionThingsIds)) {
                                $boxesInRevisionPhaseModify++;
                            }
                        }
                    }
                }

                $this->defaultKpi['total_objects_frames_created_per_user_in_revision'] = [$boxesInRevisionPhaseCreate];


                //23

                $this->defaultKpi['total_objects_frames_modified_per_user_in_revision'] = [$boxesInRevisionPhaseModify];


                //24 | real 20
                $userModifyInRevisionReview = $boxesInRevisionPhaseModify + $boxesInReviewPhaseModify;
                $this->defaultKpi['total_object_frames_modified_per_user_per_task'] = [$userModifyInRevisionReview];



                //25 | real 21

                $totalBoxInTask = 0;
                $allThingInFrameIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $task
                );

                foreach ($allThingInFrameIterator as $taskBox) {
                    if($taskBox) {
                        $totalBoxInTask++;
                    }
                }

                $this->defaultKpi['total_object_frames_currently_per_task'] = [$totalBoxInTask];



                //Attributes


                //26 | real 22
                $totalSelectAttr = 0;
                $allThingInFrameAllPhaseIterator = new PhaseThingInFrameByUser(
                    $labeledThingInFrameFacade,
                    $task
                );

                foreach ($allThingInFrameAllPhaseIterator as $thingInFrame) {
                    if($thingInFrame) {
                        if($thingInFrame->getClasses()) {
                            $totalSelectAttr += count($thingInFrame->getClasses());
                        }
                    }
                }

                $this->defaultKpi['total_attributes_currently_set_per_task'] = [$totalSelectAttr];


                //27 | real 23 labeling phase

                $totalSelectAttrLabel = 0;
                if(!empty($this->labelTasks)) {
                    foreach ($this->labelTasks as $taskId) {
                        //loop all task thing in "labeling" phase
                        $attrLabTask = $this->labelingTask->find($taskId);

                        //get BOXES by task
                        $thingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                            $labeledThingInFrameFacade,
                            $attrLabTask
                        );
                        //each all thing in frame
                        foreach ($thingInFrameLabelingPhaseIterator as $thingInFrame) {
                            // get box attribute
                            if($thingInFrame) {
                                if($thingInFrame->getClasses()) {
                                    $totalSelectAttrLabel += count($thingInFrame->getClasses());
                                }
                            }
                        }
                    }
                }
                $this->defaultKpi['total_attributes_set_per_task_in_labeling'] = [$totalSelectAttrLabel];


                //28 | real 24 review phase

                $totalSelectAttrReview = 0;


                if(!empty($this->reviewTasks)) {
                    foreach ($this->reviewTasks as $taskId) {
                        //loop all task thing in "review" phase
                        $attrRevTask = $this->labelingTask->find($taskId);

                        //get BOXES by task
                        $thingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                            $labeledThingInFrameFacade,
                            $attrRevTask
                        );
                        //each all thing in frame
                        foreach ($thingInFrameLabelingPhaseIterator as $thingInFrame) {
                            // get box attribute
                            if($thingInFrame) {
                                if($thingInFrame->getClasses()) {
                                    $totalSelectAttrReview += count($thingInFrame->getClasses());
                                }
                            }
                        }
                    }
                }

                $this->defaultKpi['total_changed_attributes_per_task_review'] = [$totalSelectAttrReview];


                //29 | real 25 revision phase

                $totalSelectAttrRevision = 0;

                if(!empty($this->revisionTasks)) {
                    foreach ($this->revisionTasks as $taskId) {
                        //loop all task thing in "revision" phase
                        $attrRevisionTask = $this->labelingTask->find($taskId);

                        //get BOXES by task
                        $thingInFrameLabelingPhaseIterator = new PhaseThingInFrameByUser(
                            $labeledThingInFrameFacade,
                            $attrRevisionTask
                        );
                        //each all thing in frame
                        foreach ($thingInFrameLabelingPhaseIterator as $thingInFrame) {
                            // get box attribute
                            if($thingInFrame) {
                                if($thingInFrame->getClasses()) {
                                    $totalSelectAttrRevision += count($thingInFrame->getClasses());
                                }
                            }
                        }
                    }
                }


                $this->defaultKpi['total_changed_attributes_per_task_revision'] = [$totalSelectAttrRevision];








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


        $this->defaultKpi['Exporter_name'] = ['expoprt file name'];








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







        $this->createCsv($dataForCsv);











        $filename = sprintf(
            'export_%s_%s.csv',
            $project->getName(),
            '_labelteam_KPI'
        );

        $zipData[$filename] = $this->csv;





        /*
        if (!isset($zipData[$filename])) {
            $zipData[$filename] = $this->getCsv($videoData);
        } else {
            $filename = sprintf(
                'export_%s_%s_%s_duplicate_%s.csv',
                str_replace(' ', '_', $project->getName()),
                $groupName,
                str_replace(' ', '_', $video->getName()),
                substr(base64_encode(random_bytes(10)), 0, 10)
            );
            $zipData[$filename] = $this->getCsv($videoData);
        }
        */

        /*
        if (count($errors) > 0) {
            $export->setStatus(Model\Export::EXPORT_STATUS_ERROR);
            $export->setErrorMessage(implode("\n", $errors));
            $this->exporterFacade->save($export);

            throw new Exception\TaskIncomplete(implode("\n", $errors));
        }
        */

        $zipContent = $this->compressData($zipData);
        $date       = new \DateTime('now', new \DateTimeZone('UTC'));
        $filename   = sprintf('export_%s.zip', $date->format('Y-m-d-H-i-s'));


        $export = new Export($project);



        $export->addAttachment($filename, $zipContent, 'application/zip');
        $export->setStatus(Export::EXPORT_STATUS_DONE);
        if (!empty($warnings)) {
            $export->setWarningMessage(implode("\n", $warnings));
        }

        return  $this->exporterFacade->save($export);

        //return $export;














       // return $dataForCsv;
    }

    private function createCsv(array $data)
    {
        $output = fopen('php://temp', 'r+');


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
            'total_objects_modified_per_user_per_task_all_phases'
        ],';');
        $i = 0;
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

                ]);
            $i++;
        }



        rewind($output);
        $this->csv = '';
        while ($line = fgets($output)) {
            $this->csv .= $line;
        }
        $this->csv .= fgets($output);
    }

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
