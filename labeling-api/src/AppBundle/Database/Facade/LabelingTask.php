<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabelingTask
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param $id
     * @return Model\LabelingTask
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabelingTask::class, $id);
    }

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
     * @param $status
     * @param null $skip
     * @param null $limit
     * @return Model\LabelingTask[]
     */
    public function findAllByStatus(
        Model\Video $video = null,
        $status,
        $skip = null,
        $limit = null
    ) {
        $startKey = [$status];
        $endKey = [$status];

        if ($video !== null) {
            $startKey[] = $video->getId();
            $endKey[] = $video->getId();
        } else {
            $startKey[] = null;
            $endKey[] = [];
        }

        $query = $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_status_videoId')
            ->setStartKey($startKey)
            ->setEndKey($endKey);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        $result = $query->onlyDocs(true)->execute()->toArray();

        uasort($result, function (Model\LabelingTask $a, Model\LabelingTask $b) {
            if (!$a->getCreatedAt() instanceof \DateTime || !$b->getCreatedAt() instanceof \DateTime ) {
                return 0;
            }
            if ($a->getCreatedAt()->getTimestamp() === $b->getCreatedAt()->getTimestamp()) {
                return 0;
            }
            return ($a->getCreatedAt()->getTimestamp() < $b->getCreatedAt()->getTimestamp()) ? -1 : 1;
        });

        return array_values($result);
    }

    /**
     * @param $projects
     * @return array
     */
    public function findAllByProjects($projects)
    {
        $projectIds = array_map(function(Model\Project $project) {
            return $project->getId();
        }, $projects);

        $query = $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_project_and_video_as_value')
            ->setKeys($projectIds)
            ->execute()
            ->toArray();

        return $query;
    }

    /**
     * @param $status
     * @param Model\Project|null $project
     * @param null $skip
     * @param null $limit
     * @return array
     */
    public function findAllByStatusAndProject(
        $status,
        Model\Project $project = null,
        $skip = null,
        $limit = null
    ) {
        $startKey = [$status];
        $endKey = [$status];

        if ($project !== null) {
            $startKey[] = $project->getId();
            $endKey[] = $project->getId();
        } else {
            $startKey[] = null;
            $endKey[] = [];
        }

        $query = $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_status_and_project')
            ->setStartKey($startKey)
            ->setEndKey($endKey);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        return $query->onlyDocs(true)->execute();
    }

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
            ->createQuery('annostation_labeled_frame', 'by_taskId_frameIndex')
            ->setStartKey([$labelingTask->getId(), (int) $startFrameIndex])
            ->setEndKey([$labelingTask->getId(), (int) $endFrameIndex])
            ->onlyDocs(true)
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
            $tmp = $startFrameIndex;
            $startFrameIndex = $endFrameIndex;
            $endFrameIndex = $tmp;
        }

        $result = $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskId_frameIndex')
            ->setStartKey([$task->getId(), $endFrameIndex])
            ->setEndKey([$task->getId(), $startFrameIndex])
            ->setDescending(true)
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
     * @param Model\LabelingTask $labelingTask
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

    public function getLabeledThingsInFrameForFrameIndex(Model\LabelingTask $labelingTask, $frameIndex)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameIndex')
            ->setKey([$labelingTask->getId(), (int) $frameIndex])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

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

    public function saveTimer(Model\TaskTimer $taskTimer)
    {
        $this->documentManager->persist($taskTimer);
        $this->documentManager->flush();
    }

    public function getTotalTimesGroupedByTaskId(array $tasks = null)
    {
        if ($tasks !== null) {
            $idsInChunks = array_chunk($this->mapTasksToTaskIds($tasks), 100);
            $timesGroupedById = array();
            foreach ($idsInChunks as $idsInChunk) {
                $timesGroupedById = array_merge(
                    $timesGroupedById,
                    $this->documentManager
                        ->createQuery('annostation_task_timer', 'sum_by_taskId')
                        ->setGroup(true)
                        ->setKeys($idsInChunk)
                        ->execute()
                        ->toArray()
                );
            }
        }else{
            $query = $this->documentManager
                ->createQuery('annostation_task_timer', 'sum_by_taskId')
                ->setGroup(true);
            $timesGroupedById = $query->execute()->toArray();
        }

        return array_column($timesGroupedById, 'value', 'key');
    }

    public function getTotalNumberOfLabeledThingsGroupedByTaskId(array $tasks = null)
    {
        if ($tasks !== null) {
            $idsInChunks = array_chunk($this->mapTasksToTaskIds($tasks), 100);
            $result = array();
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
        }else{
            $query = $this->documentManager
                ->createQuery('annostation_labeled_thing', 'count_by_taskId')
                ->setGroup(true);

            $result = $query->execute()->toArray();
        }

        return array_column($result, 'value', 'key');
    }

    public function mapTasksToTaskIds(array $tasks)
    {
        return array_map(
            function(Model\LabelingTask $task) {
                return $task->getId();
            },
            $tasks
        );
    }

    /**
     * @param Model\LabelingTask $task
     * @return array
     */
    public function getLabelStructure(Model\LabelingTask $task)
    {
        return $task->getLabelStructure();
    }

    /**
     * @param Model\LabelingTask $task
     * @return array
     */
    public function getLabelAnnotation(Model\LabelingTask $task)
    {
        return $task->getLabelStructureUi();
    }

    /**
     * @param Model\Project $project
     * @return \Doctrine\CouchDB\View\Result
     */
    public function getSumOfTasksByProject(Model\Project $project)
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeling_task', 'sum_of_tasks_by_project_and_status')
            ->setStartKey([$project->getId()])
            ->setEndKey([$project->getId(), []])
            ->setGroup(true)
            ->setGroupLevel(2)
            ->setReduce(true)
            ->execute()
            ->toArray();

        $result[$project->getId()] = [
            Model\LabelingTask::STATUS_PREPROCESSING => 0,
            Model\LabelingTask::STATUS_WAITING => 0,
            Model\LabelingTask::STATUS_LABELED => 0,
        ];
        foreach ($query as $mapping) {
            $result[$mapping['key'][0]][$mapping['key'][1]] = $mapping['value'];
        }

        return $result;
    }
}
