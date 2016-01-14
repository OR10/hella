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

    public function findAllEnabled(Model\Video $video = null, $enabled = true)
    {
        $startKey = [$enabled];
        $endKey = [$enabled];
        if ($video !== null) {
            $startKey[] = $video->getId();
            $endKey[] = $video->getId();
        } else {
            $startKey[] = null;
            $endKey[] = [];
        }

        return $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_enabled_videoId')
            ->setStartKey($startKey)
            ->setEndKey($endKey)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function getVideo(Model\LabelingTask $labelingTask)
    {
        return $this->documentManager->find(Model\Video::class, $labelingTask->getVideoId());
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param null               $startFrameNumber
     * @param null               $endFrameNumber
     *
     * @return Model\LabeledFrame[]
     */
    public function getLabeledFrames(
        Model\LabelingTask $labelingTask,
        $startFrameNumber = null,
        $endFrameNumber = null
    ) {
        if ($startFrameNumber === null) {
            $startFrameNumber = $labelingTask->getFrameRange()->getStartFrameNumber();
        }

        if ($endFrameNumber === null) {
            $endFrameNumber = $labelingTask->getFrameRange()->getEndFrameNumber();
        }

        return $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskId_frameNumber')
            ->setStartKey([$labelingTask->getId(), (int) $startFrameNumber])
            ->setEndKey([$labelingTask->getId(), (int) $endFrameNumber])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param int                $frameNumber
     *
     * @return Model\LabeledFrame|null
     */
    public function getLabeledFrame(Model\LabelingTask $labelingTask, $frameNumber)
    {
        $result = $this->getLabeledFrames($labelingTask, $frameNumber, $frameNumber);

        if (empty($result)) {
            return null;
        }

        return $result[0];
    }

    /**
     * @param Model\LabelingTask $task
     * @param int                $frameNumber
     *
     * @return Model\LabeledFrame|null
     */
    public function getCurrentOrPreceedingLabeledFrame(Model\LabelingTask $task, $frameNumber)
    {
        $task->getFrameRange()->throwIfFrameNumberIsNotCovered($frameNumber);

        $startFrameNumber = $task->getFrameRange()->getStartFrameNumber();
        $endFrameNumber   = $frameNumber;

        if ($startFrameNumber > $endFrameNumber) {
            $tmp = $startFrameNumber;
            $startFrameNumber = $endFrameNumber;
            $endFrameNumber = $tmp;
        }

        $result = $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskId_frameNumber')
            ->setStartKey([$task->getId(), $endFrameNumber])
            ->setEndKey([$task->getId(), $startFrameNumber])
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
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameNumber')
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

    public function getLabeledThingsInFrameForFrameNumber(Model\LabelingTask $labelingTask, $frameNumber)
    {
        $labelingTask->getFrameRange()->throwIfFrameNumberIsNotCovered($frameNumber);

        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameNumber')
            ->setKey([$labelingTask->getId(), (int) $frameNumber])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function getLabeledThingsInFrameForFrameRange(
        Model\LabelingTask $labelingTask,
        $startFrameNumber = null,
        $endFrameNumber = null
    ) {
        if ($startFrameNumber === null) {
            $startFrameNumber = $labelingTask->getFrameRange()->getStartFrameNumber();
        }

        if ($endFrameNumber === null) {
            $endFrameNumber = $labelingTask->getFrameRange()->getEndFrameNumber();
        }

        $labelingTask->getFrameRange()->throwIfFrameNumberIsNotCovered($startFrameNumber);
        $labelingTask->getFrameRange()->throwIfFrameNumberIsNotCovered($endFrameNumber);

        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameNumber')
            ->setStartKey([$labelingTask->getId(), (int) $startFrameNumber])
            ->setEndKey([$labelingTask->getId(), (int) $endFrameNumber])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function save(Model\LabelingTask $labelingTask)
    {
        $this->documentManager->persist($labelingTask);
        $this->documentManager->flush();
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
}
