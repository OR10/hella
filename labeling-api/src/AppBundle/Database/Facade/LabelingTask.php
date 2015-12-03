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
        return $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskid_framenumber')
            ->setStartKey([$labelingTask->getId(), $startFrameNumber === null ? 0 : (int) $startFrameNumber])
            ->setEndKey([$labelingTask->getId(), $endFrameNumber === null ? [] : (int) $endFrameNumber])
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
        $startFrameNumber = $task->getFrameRange()->getStartFrameNumber();
        $endFrameNumber   = $frameNumber;

        if ($startFrameNumber > $endFrameNumber) {
            $tmp = $startFrameNumber;
            $startFrameNumber = $endFrameNumber;
            $endFrameNumber = $tmp;
        }

        $result = $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskid_framenumber')
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
            ->createQuery('annostation_labeled_thing', 'by_taskid')
            ->setStartKey($labelingTask->getId())
            ->setEndKey($labelingTask->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function getLabeledThingsInFrameForFrameNumber(Model\LabelingTask $labelingTask, $frameNumber)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId_frameNumber')
            ->setKey([$labelingTask->getId(), (int) $frameNumber])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function save(Model\LabelingTask $labelingTask)
    {
        $this->documentManager->persist($labelingTask);
        $this->documentManager->flush();
    }
}
