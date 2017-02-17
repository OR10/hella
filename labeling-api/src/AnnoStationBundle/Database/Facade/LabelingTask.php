<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabelingTask
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * LabelingTask constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param $id
     *
     * @return Model\LabelingTask
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabelingTask::class, $id);
    }

    /**
     * @param string[] $ids
     *
     * @return Model\LabelingTask[]
     */
    public function findByVideoIds(array $ids)
    {
        $idsInChunks = array_chunk($ids, 100);

        $tasks = array();
        foreach ($idsInChunks as $idsInChunk) {
            $tasks = array_merge(
                $tasks,
                $this->documentManager
                    ->createQuery('annostation_labeling_task_by_video_id_001', 'view')
                    ->setKeys($idsInChunk)
                    ->onlyDocs(true)
                    ->execute()
                    ->toArray()
            );
        }

        return $tasks;
    }

    /**
     * @return Model\LabelingTask[]
     */
    public function findAll()
    {
        return $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\Video|null $video
     * @param string           $status
     * @param int              $skip
     * @param int              $limit
     * @param string           $phase
     *
     * @return Model\LabelingTask[]
     */
    public function findAllByStatus(
        string $status,
        Model\Video $video = null,
        int $skip = null,
        int $limit = null,
        string $phase = Model\LabelingTask::PHASE_LABELING
    ) {
        $startKey = [$phase, $status];
        $endKey   = [$phase, $status];

        if ($video !== null) {
            $startKey[] = $video->getId();
            $endKey[]   = $video->getId();
        } else {
            $startKey[] = null;
            $endKey[]   = [];
        }

        $query = $this->documentManager
            ->createQuery('annostation_labeling_task_by_phase_status_and_video_001', 'view')
            ->onlyDocs(true)
            ->setStartKey($startKey)
            ->setEndKey($endKey);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        $result = $query->execute()->toArray();

        uasort(
            $result,
            function (Model\LabelingTask $a, Model\LabelingTask $b) {
                if (!$a->getCreatedAt() instanceof \DateTime || !$b->getCreatedAt() instanceof \DateTime) {
                    return 0;
                }

                if ($a->getCreatedAt()->getTimestamp() === $b->getCreatedAt()->getTimestamp()) {
                    return 0;
                }

                return ($a->getCreatedAt()->getTimestamp() < $b->getCreatedAt()->getTimestamp()) ? -1 : 1;
            }
        );

        return array_values($result);
    }

    /**
     * @param Model\Project $project
     *
     * @return Model\LabelingTask[]
     */
    public function findAllByProject(Model\Project $project, $onlyDocs = false)
    {
        return $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_project_and_video_as_value')
            ->onlyDocs($onlyDocs)
            ->setKey($project->getId())
            ->execute()
            ->toArray();
    }

    /**
     * @param $projects
     *
     * @return array
     */
    public function findAllByProjects($projects)
    {
        $projectIds = array_map(
            function (Model\Project $project) {
                return $project->getId();
            },
            $projects
        );

        $query = $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_project_and_video_as_value')
            ->setKeys($projectIds)
            ->execute()
            ->toArray();

        return $query;
    }

    /**
     * @param string             $status
     * @param Model\Project|null $project
     * @param int|null           $skip
     * @param int|null           $limit
     * @param string             $phase
     *
     * @return \Doctrine\CouchDB\View\Result
     */
    public function findAllByStatusAndProject(
        string $status,
        Model\Project $project = null,
        int $skip = null,
        int $limit = null,
        string $phase = Model\LabelingTask::PHASE_LABELING
    ) {
        $startKey = [$phase, $status];
        $endKey   = [$phase, $status];

        if ($project !== null) {
            $startKey[] = $project->getId();
            $endKey[]   = $project->getId();
        } else {
            $startKey[] = null;
            $endKey[]   = [];
        }

        $query = $this->documentManager
            ->createQuery('annostation_labeling_task_by_phase_status_and_project_001', 'view')
            ->onlyDocs(true)
            ->setStartKey($startKey)
            ->setEndKey($endKey);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        return $query->execute();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return Model\Video
     */
    public function getVideo(Model\LabelingTask $labelingTask)
    {
        return $this->documentManager->find(Model\Video::class, $labelingTask->getVideoId());
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param null               $startFrameIndex
     * @param null               $endFrameIndex
     *
     * @return Model\LabeledFrame[]
     */
    public function getLabeledFrames(
        Model\LabelingTask $labelingTask,
        $startFrameIndex = null,
        $endFrameIndex = null
    ) {
        if ($startFrameIndex === null) {
            $startFrameIndex = min(array_keys($labelingTask->getFrameNumberMapping()));
        }

        if ($endFrameIndex === null) {
            $endFrameIndex = max(array_keys($labelingTask->getFrameNumberMapping()));
        }

        return $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskId_frameIndex')
            ->onlyDocs(true)
            ->setStartKey([$labelingTask->getId(), (int) $startFrameIndex])
            ->setEndKey([$labelingTask->getId(), (int) $endFrameIndex])
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param int                $frameIndex
     *
     * @return Model\LabeledFrame|null
     */
    public function getLabeledFrame(Model\LabelingTask $labelingTask, $frameIndex)
    {
        $result = $this->getLabeledFrames($labelingTask, $frameIndex, $frameIndex);

        if (empty($result)) {
            return null;
        }

        return $result[0];
    }

    /**
     * @param Model\LabelingTask $task
     * @param int                $frameIndex
     *
     * @return Model\LabeledFrame|null
     */
    public function getCurrentOrPreceedingLabeledFrame(Model\LabelingTask $task, $frameIndex)
    {
        $startFrameIndex = min(array_keys($task->getFrameNumberMapping()));
        $endFrameIndex   = $frameIndex;

        if ($startFrameIndex > $endFrameIndex) {
            $tmp             = $startFrameIndex;
            $startFrameIndex = $endFrameIndex;
            $endFrameIndex   = $tmp;
        }

        $result = $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskId_frameIndex')
            ->onlyDocs(true)
            ->setStartKey([$task->getId(), $endFrameIndex])
            ->setEndKey([$task->getId(), $startFrameIndex])
            ->setDescending(true)
            ->setLimit(1)
            ->execute()
            ->toArray();

        if (empty($result)) {
            return null;
        }

        return $result[0];
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return Model\LabeledThing[]
     */
    public function getLabeledThings(Model\LabelingTask $labelingTask)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing', 'by_taskId')
            ->setStartKey($labelingTask->getId())
            ->setEndKey($labelingTask->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param null               $skip
     * @param null               $limit
     *
     * @return array
     */
    public function getLabeledThingsInFrame(Model\LabelingTask $labelingTask, $skip = null, $limit = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameIndex')
            ->setStartKey([$labelingTask->getId()])
            ->setEndKey([$labelingTask->getId(), []]);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        return $query->onlyDocs(true)->execute()->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param                    $frameIndex
     *
     * @return array
     */
    public function getLabeledThingsInFrameForFrameIndex(Model\LabelingTask $labelingTask, $frameIndex)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameIndex')
            ->setKey([$labelingTask->getId(), (int) $frameIndex])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param null               $startFrameIndex
     * @param null               $endFrameIndex
     *
     * @return array
     */
    public function getLabeledThingsInFrameForFrameRange(
        Model\LabelingTask $labelingTask,
        $startFrameIndex = null,
        $endFrameIndex = null
    ) {
        if ($startFrameIndex === null) {
            $startFrameIndex = min(
                array_keys($labelingTask->getFrameNumberMapping())
            );
        }

        if ($endFrameIndex === null) {
            $endFrameIndex = max(
                array_keys($labelingTask->getFrameNumberMapping())
            );
        }

        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameIndex')
            ->setStartKey([$labelingTask->getId(), (int) $startFrameIndex])
            ->setEndKey([$labelingTask->getId(), (int) $endFrameIndex])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return Model\LabelingTask
     */
    public function save(Model\LabelingTask $labelingTask)
    {
        $this->documentManager->persist($labelingTask);
        $this->documentManager->flush();

        return $labelingTask;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $this->documentManager->remove($labelingTask);
        $this->documentManager->flush();
    }

    /**
     * @param Model\LabelingTask $task
     * @param Model\User         $user
     *
     * @return Model\TaskTimer|null
     */
    public function getTimerForTaskAndUser(Model\LabelingTask $task, Model\User $user)
    {
        $result = $this->documentManager
            ->createQuery('annostation_task_timer', 'by_taskId_userId')
            ->setKey([$task->getId(), $user->getId()])
            ->setLimit(1)
            ->onlyDocs(true)
            ->execute()
            ->toArray();

        if (empty($result)) {
            return null;
        }

        return $result[0];
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return Model\TaskTimer|array
     */
    public function getTimeInSecondsForTask(Model\LabelingTask $task)
    {
        $result = $this->documentManager
            ->createQuery('annostation_task_timer_sum_by_taskId_001', 'view')
            ->setKey($task->getId())
            ->setLimit(1)
            ->setReduce(true)
            ->execute()
            ->toArray();

        if (empty($result)) {
            return [];
        }

        return $result[0]['value'];
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return mixed
     */
    public function getTaskTimerByTask(Model\LabelingTask $labelingTask)
    {
        $query = $this->documentManager
            ->createQuery('annostation_task_timer', 'by_taskId_userId')
            ->setStartKey([$labelingTask->getId()])
            ->setEndKey([$labelingTask->getId(), []]);

        return $query->onlyDocs(true)->execute()->toArray();
    }

    /**
     * @param Model\TaskTimer $taskTimer
     */
    public function saveTimer(Model\TaskTimer $taskTimer)
    {
        $this->documentManager->persist($taskTimer);
        $this->documentManager->flush();
    }

    /**
     * @param Model\TaskTimer $taskTimer
     */
    public function deleteTimer(Model\TaskTimer $taskTimer)
    {
        $this->documentManager->remove($taskTimer);
        $this->documentManager->flush();
    }

    /**
     * @param array|null $tasks
     *
     * @return array
     */
    public function getTotalNumberOfLabeledThingsGroupedByTaskId(array $tasks = null)
    {
        if ($tasks !== null) {
            $idsInChunks = array_chunk($this->mapTasksToTaskIds($tasks), 100);
            $result      = array();
            foreach ($idsInChunks as $idsInChunk) {
                $result = array_merge(
                    $result,
                    $this->documentManager
                        ->createQuery('annostation_labeled_thing', 'count_by_taskId')
                        ->setGroup(true)
                        ->setKeys($idsInChunk)
                        ->execute()
                        ->toArray()
                );
            }
        } else {
            $query = $this->documentManager
                ->createQuery('annostation_labeled_thing', 'count_by_taskId')
                ->setGroup(true);

            $result = $query->execute()->toArray();
        }

        return array_column($result, 'value', 'key');
    }

    /**
     * @param array $tasks
     *
     * @return array
     */
    public function mapTasksToTaskIds(array $tasks)
    {
        return array_map(
            function (Model\LabelingTask $task) {
                return $task->getId();
            },
            $tasks
        );
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return array
     */
    public function getLabelStructure(Model\LabelingTask $task)
    {
        return $task->getLabelStructure();
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return array
     */
    public function getLabelAnnotation(Model\LabelingTask $task)
    {
        return $task->getLabelStructureUi();
    }

    /**
     * @param Model\Project $project
     *
     * @return array
     */
    public function getSumOfTasksByPhaseForProject(Model\Project $project)
    {
        $result = array();
        $query  = $this->documentManager
            ->createQuery('annostation_labeling_task_sum_of_tasks_by_project_phase_and_status_001', 'view')
            ->setStartKey([$project->getId()])
            ->setEndKey([$project->getId(), []])
            ->setGroup(true)
            ->setReduce(true)
            ->execute()
            ->toArray();

        $phases = array(
            Model\LabelingTask::PHASE_PREPROCESSING,
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::PHASE_REVIEW,
            Model\LabelingTask::PHASE_REVISION,
        );
        foreach ($phases as $phase) {
            $result[$phase] = [
                Model\LabelingTask::STATUS_TODO                     => 0,
                Model\LabelingTask::STATUS_IN_PROGRESS              => 0,
                Model\LabelingTask::STATUS_DONE                     => 0,
                Model\LabelingTask::STATUS_WAITING_FOR_PRECONDITION => 0,
                Model\LabelingTask::STATUS_FAILED                   => 0,
            ];
        }
        foreach ($query as $mapping) {
            $result[$mapping['key'][1]][$mapping['key'][2]] = $mapping['value'];
        }

        return $result;
    }

    /**
     * @return \Doctrine\CouchDB\View\Result
     */
    public function getSumOfTasksByStatus()
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeling_task_sum_of_tasks_by_project_phase_and_status_001', 'view')
            ->setReduce(true)
            ->onlyDocs(false);

        return $query->execute();
    }

    /**
     * @param Model\Project $project
     * @param               $phase
     * @param               $status
     *
     * @return int
     */
    public function getSumOfTasksByProjectAndStatus(Model\Project $project, $phase, $status)
    {
        $sumOfPreProcessingTasks = $this->documentManager
            ->createQuery('annostation_labeling_task_sum_of_tasks_by_project_phase_and_status_001', 'view')
            ->setKey([$project->getId(), $phase, $status])
            ->setGroup(true)
            ->setReduce(true)
            ->execute()
            ->toArray();

        if (!isset($sumOfPreProcessingTasks[0]['value'])) {
            return 0;
        }

        return $sumOfPreProcessingTasks[0]['value'];
    }

    /**
     * @param Model\Project $project
     *
     * @param int           $skip
     * @param int           $limit
     *
     * @return array
     */
    public function getAttentionTasksForProject(Model\Project $project, int $skip = null, int $limit = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_attention_labeling_task_by_project_001', 'view')
            ->setStartKey([$project->getId()])
            ->setEndKey([$project->getId()])
            ->setReduce(false)
            ->onlyDocs(true);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        return $query->execute()->toArray();
    }

    /**
     * @param Model\Project $project
     *
     * @return int
     */
    public function getTotalAttentionTasksCountForProject(Model\Project $project)
    {
        $query = $this->documentManager
            ->createQuery('annostation_attention_labeling_task_by_project_001', 'view')
            ->setStartKey([$project->getId()])
            ->setEndKey([$project->getId()])
            ->setReduce(true)
            ->execute()
            ->toArray();

        if (empty($query)) {
            return 0;
        }

        return (int) $query[0]['value'];
    }

    /**
     * @param Model\Project $project
     * @param null          $skip
     * @param null          $limit
     *
     * @return \Doctrine\CouchDB\View\Result
     */
    public function getAllDoneLabelingTasksForProject(Model\Project $project, $skip = null, $limit = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeling_task_all_done_by_project_001', 'view')
            ->onlyDocs(true)
            ->setReduce(false)
            ->setKey([$project->getId()]);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        return $query->execute();
    }

    /**
     * @param Model\Project $project
     *
     * @return int
     */
    public function getSumOfAllDoneLabelingTasksForProject(Model\Project $project)
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeling_task_all_done_by_project_001', 'view')
            ->onlyDocs(false)
            ->setKey([$project->getId()])
            ->setReduce(true);

        $result = $query->execute()->toArray();

        if (isset($result[0]) && isset($result[0]['value'])) {
            return $result[0]['value'];
        }

        return 0;
    }
}
