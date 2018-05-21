<?php

namespace AnnoStationBundle\Service\v1\Project;

use AnnoStationBundle\Database\Facade\Campaign;
use AnnoStationBundle\Database\Facade\TaskTimer\FacadeInterface;
use AnnoStationBundle\Helper\Iterator\LabeledThingInFrame;
use AnnoStationBundle\Helper\Iterator\TaskTimeByTask;
use AnnoStationBundle\Model\Organisation;
use AnnoStationBundle\Service\Authentication\UserPermissions;
use AppBundle\Database\Facade\User;
use AppBundle\Model\LabelingTask;
use AppBundle\Model\Project;

class ProjectService
{
    /**
     * @var FacadeInterface
     */
    private $labeledTimeFacadeFactory;

    /**
     * @var \AnnoStationBundle\Database\Facade\LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingFrameFacadeFactory;

    /**
     * @var UserPermissions
     */
    private $userPermissions;

    /**
     * @var \AnnoStationBundle\Database\Facade\LabelingTask\FacadeInterface
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var Campaign
     */
    private $campaignFacade;

    /**
     * @var User
     */
    private $userFacade;

    /**
     * ProjectService constructor.
     *
     * @param FacadeInterface                                                        $labeledTimeFacadeFactory
     * @param \AnnoStationBundle\Database\Facade\LabeledThingInFrame\FacadeInterface $labeledThingFrameFacadeFactory
     * @param UserPermissions                                                        $userPermissions
     * @param \AnnoStationBundle\Database\Facade\LabelingTask\FacadeInterface        $labelingTaskFacadeFactory
     * @param Campaign                                                               $campaignFacade
     * @param User                                                                   $userFacade
     */
    public function __construct(
        FacadeInterface $labeledTimeFacadeFactory,
        \AnnoStationBundle\Database\Facade\LabeledThingInFrame\FacadeInterface $labeledThingFrameFacadeFactory,
        UserPermissions $userPermissions,
        \AnnoStationBundle\Database\Facade\LabelingTask\FacadeInterface $labelingTaskFacadeFactory,
        Campaign $campaignFacade,
        User $userFacade
    )
    {
        $this->labeledTimeFacadeFactory              = $labeledTimeFacadeFactory;
        $this->labeledThingFrameFacadeFactory        = $labeledThingFrameFacadeFactory;
        $this->userPermissions                       = $userPermissions;
        $this->labelingTaskFacadeFactory             = $labelingTaskFacadeFactory;
        $this->campaignFacade                        = $campaignFacade;
        $this->userFacade                            = $userFacade;
    }

    /**
     * @param string[] $projects
     * @param \AnnoStationBundle\Database\Facade\LabelingTask $labelingTaskFacade
     * @param Organisation $organisation
     * @return array
     */
    public function projectList(array $projects, \AnnoStationBundle\Database\Facade\LabelingTask $labelingTaskFacade, Organisation$organisation)
    {
        $response = [
            Project::STATUS_IN_PROGRESS => [],
            Project::STATUS_TODO        => [],
            Project::STATUS_DONE        => [],
            Project::STATUS_DELETED     => [],
            null                              => [] //@TODO remove this later
        ];
        $result = [];
        $usersIds = [];
        $users = [];

        $sumOfTasksForProjects                  = $this->getSumOfTasksForProjects($projects);
        $sumOfCompletedTasksForProjects         = $labelingTaskFacade->getSumOfAllDoneLabelingTasksForProjects(
            $projects
        );
        $numberOfLabeledThingInFramesByProjects = $this->labeledThingFrameFacadeFactory->getReadOnlyFacade()
            ->getSumOfLabeledThingInFramesByProjects($projects);

        $tasksByProjects = $labelingTaskFacade->findAllByProjects($projects);
        $numberOfVideos     = array();
        foreach ($tasksByProjects as $taskByProjects) {
            $projectId                    = $taskByProjects['key'];
            $videoId                      = $taskByProjects['value'];
            $numberOfVideos[$projectId][] = $videoId;
        }

        $numberOfVideos = array_map(
            function ($videoByProject) {
                return count(array_unique($videoByProject));
            },
            $numberOfVideos
        );

        /** @var Project $project */
        foreach ($projects as $project) {
            //calculate project labeling time
            $allProjectTask = $labelingTaskFacade->findAllByProject($project);

            $projectDetails = $this->calculateProjectDetails($allProjectTask, $project, $labelingTaskFacade);

            if (!isset($sumOfTasksForProjects[$project->getId()])) {
                $sumOfTasksForProjects[$project->getId()] = 0;
            }
            $timeInSeconds = isset($projectTimeMapping[$project->getId()]) ? $projectTimeMapping[$project->getId()] : 0;

            $sumOfCompletedTasksForProject = !isset($sumOfCompletedTasksForProjects[$project->getId()]) ? 0 : $sumOfCompletedTasksForProjects[$project->getId()];
            $sumOfTasksByPhaseForProject   = $labelingTaskFacade->getSumOfTasksByPhaseForProject($project);

            $sumOfFailedTasks        = 0;
            $sumOfPreProcessingTasks = 0;
            foreach ($sumOfTasksByPhaseForProject as $phase => $states) {
                $sumOfFailedTasks += $states[LabelingTask::STATUS_FAILED];
                if ($phase === LabelingTask::PHASE_PREPROCESSING) {
                    $sumOfPreProcessingTasks += $states[LabelingTask::STATUS_TODO];
                }
            }

            $responseProject               = [
                'id'                          => $project->getId(),
                'userId'                      => $project->getUserId(),
                'name'                        => $project->getName(),
                'status'                      => $project->getStatus(),
                'lastStatusChangeTimestamp'   => $project->getLastStateForStatus($project->getStatus()) === null ? null : $project->getLastStateForStatus($project->getStatus())['timestamp'],
                'labelingGroupId'             => $project->getLabelingGroupId(),
                'finishedPercentage'          => floor(
                    $sumOfTasksForProjects[$project->getId()] === 0 ? 0 : 100 / $sumOfTasksForProjects[$project->getId()] * $sumOfCompletedTasksForProject
                ),
                'creationTimestamp'           => $project->getCreationDate(),
                'taskInPreProcessingCount'    => $sumOfPreProcessingTasks,
                'diskUsage'                   => $project->getDiskUsageInBytes() === null ? [] : ['total' => $project->getDiskUsageInBytes()],
                'campaigns'                   => $this->mapCampaignIdsToCampaigns($organisation, $project->getCampaigns()),
            ];

            if ($this->userPermissions->hasPermission('canViewProjectManagementRelatedStatisticsColumn')) {
                $taskInProgressCount = 0;
                $taskFailedCount     = 0;

                foreach ($sumOfTasksByPhaseForProject as $phase => $states) {
                    $taskInProgressCount += $states[LabelingTask::STATUS_IN_PROGRESS];
                    $taskFailedCount     += $states[LabelingTask::STATUS_FAILED];
                }

                $responseProject['taskCount']                  = $sumOfTasksForProjects[$project->getId()];
                $responseProject['taskFinishedCount']          = $sumOfCompletedTasksForProject;
                $responseProject['taskInProgressCount']        = $taskInProgressCount;
                $responseProject['taskFailedCount']            = $taskFailedCount;
                $responseProject['totalLabelingTimeInSeconds'] = (isset($projectDetails['projectLabelingTime'][$project->getId()])) ? array_sum($projectDetails['projectLabelingTime'][$project->getId()]) : 0;
                $responseProject['labeledThingInFramesCount'] = isset(
                    $projectDetails['projectThingInFrame'][$project->getId()]
                ) ? array_sum($projectDetails['projectThingInFrame'][$project->getId()]) : 0;
                $responseProject['videosCount']                = isset(
                    $numberOfVideos[$project->getId()]
                ) ? $numberOfVideos[$project->getId()] : 0;
                $responseProject['dueTimestamp']               = $project->getDueDate();
                if (!empty($project->getGenericXmlTaskInstructions())) {
                    $responseProject['taskInstructionType'] = 'genericXml';
                } elseif (!empty($project->getRequirementsXmlTaskInstructions())) {
                    $responseProject['taskInstructionType'] = 'requirementsXml';
                } else {
                    $responseProject['taskInstructionType'] = 'legacy';
                }
            }

            if ($this->userPermissions->hasPermission('canViewDeletedProjects')) {
                $responseProject['deletedState'] = $project->getDeletedState();
            }

            if ($this->userPermissions->hasPermission('canViewProjectsAssignedLabelManager')) {
                $responseProject['labelManager'] = $project->getLatestAssignedLabelManagerUserId();
                if ($responseProject['labelManager'] !== null) {
                    $users_ids[] = $responseProject['labelManager'];
                    $users[] = $this->userFacade->getUserById($responseProject['labelManager']);
                }
            }

            $response[$project->getStatus()][] = $responseProject;
            $usersIds[] = $project->getUserId();
        }

        $result['result'] = $response;
        $result['usersIds'] = $usersIds;
        $result['users'] = $users;

        return $result;
    }

    /**
     * @param int[] $allProjectTask
     * @param Project $project
     * @param \AnnoStationBundle\Database\Facade\LabelingTask $labelingTaskFacade
     * @return int[]
     */
    private function calculateProjectDetails(array $allProjectTask, Project $project, \AnnoStationBundle\Database\Facade\LabelingTask $labelingTaskFacade)
    {
        $projectLabelingTime = [];
        $projectThingInFrame = [];
        $result = [];
        $thingInProject = 0;
        foreach ($allProjectTask as $projectTask) {
            if(isset($projectTask)) {
                $labeledTimeFacade = $this->labeledTimeFacadeFactory->getFacadeByProjectIdAndTaskId(
                    $project->getId(),
                    $projectTask['id']
                );
                $task = $labelingTaskFacade->find($projectTask['id']);
                $labeledTimeIterator = new TaskTimeByTask(
                    $task,
                    $labeledTimeFacade
                );
                foreach ($labeledTimeIterator as $labelingTime) {
                    if (isset($labelingTime)) {
                        if ($labelingTime->getProjectId() === $project->getId()) {
                            $projectLabelingTime[$project->getId()][] = $labelingTime->getTimeInSeconds('labeling');
                        }
                    }
                }
                //calculate project thing in frame
                $labeledThingFacade = $this->labeledThingFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
                    $project->getId(),
                    $task->getId()
                );
                $labeledThingInFrameIterator = new LabeledThingInFrame($labeledThingFacade, $task);
                foreach ($labeledThingInFrameIterator as $thingInFrame) {
                    $thingInProject++;
                }
            }
            $projectThingInFrame[$project->getId()][] = $thingInProject;
        }
        $result['projectLabelingTime'] = $projectLabelingTime;
        $result['projectThingInFrame'] = $projectThingInFrame;

        return $result;
    }

    /**
     * @param Organisation $organisation
     * @param string[] $campaignIds
     * @return array
     */
    private function mapCampaignIdsToCampaigns(Organisation $organisation, array $campaignIds) {
        if ($campaignIds === null || count(array_filter($campaignIds)) < 1) {
            return [];
        }

        return array_map(
            function ($id) {
                $campaign = $this->campaignFacade->find($id);

                return [
                    'id'   => $campaign->getId(),
                    'name' => $campaign->getName(),
                ];
            },
            $campaignIds
        );
    }

    /**
     * @param string[] $projects
     * @return int[]
     */
    private function getSumOfTasksForProjects(array $projects)
    {

        $labelingTaskFacade  = $this->labelingTaskFacadeFactory->getReadOnlyFacade();
        $taskIdsByProjectIds = $labelingTaskFacade->findAllByProjects($projects);

        $numberOfTaskInProject = [];
        foreach ($taskIdsByProjectIds as $taskIdsByProjectId) {
            $projectId                         = $taskIdsByProjectId['key'];
            $numberOfTaskInProject[$projectId] = isset($numberOfTaskInProject[$projectId]) ? $numberOfTaskInProject[$projectId] + 1 : 1;
        }

        return $numberOfTaskInProject;
    }
}
