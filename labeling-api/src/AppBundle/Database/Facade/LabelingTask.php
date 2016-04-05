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

        return $query->onlyDocs(true)->execute()->toArray();
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
            $startFrameIndex = min($labelingTask->getFrameNumberMapping());
        }

        if ($endFrameIndex === null) {
            $endFrameIndex = max($labelingTask->getFrameNumberMapping());
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
        $startFrameIndex = min($task->getFrameNumberMapping());
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
            $startFrameIndex = min($labelingTask->getFrameNumberMapping());
        }

        if ($endFrameIndex === null) {
            $endFrameIndex = max($labelingTask->getFrameNumberMapping());
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
        $query = $this->documentManager
            ->createQuery('annostation_task_timer', 'sum_by_taskId')
            ->setGroup(true);

        if ($tasks !== null) {
            $query->setKeys($this->mapTasksToTaskIds($tasks));
        }

        $result = $query->execute()->toArray();

        return array_column($result, 'value', 'key');
    }

    public function getTotalNumberOfLabeledThingsGroupedByTaskId(array $tasks = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeled_thing', 'count_by_taskId')
            ->setGroup(true);

        if ($tasks !== null) {
            $query->setKeys($this->mapTasksToTaskIds($tasks));
        }

        $result = $query->execute()->toArray();

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
}
