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
     * @return mixed
     */
    public function getLabeledFrames(
        Model\LabelingTask $labelingTask,
        $startFrameNumber = null,
        $endFrameNumber = null
    ) {
        $startKey = array(
            $labelingTask->getId(),
            0
        );
        $endKey   = array(
            $labelingTask->getId(),
            array()
        );
        if ($startFrameNumber !== null && $endFrameNumber !== null) {
            $startKey = array(
                $labelingTask->getId(),
                (int)$startFrameNumber
            );
            $endKey   = array(
                $labelingTask->getId(),
                (int)$endFrameNumber
            );
        }

        return $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskid_framenumber')
            ->setStartKey($startKey)
            ->setEndKey($endKey)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
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
        $labeledThingIds = $this->documentManager
            ->createQuery('annostation_labeled_thing', 'by_taskId_frameNumber')
            ->setKey([$labelingTask->getId(), (int) $frameNumber])
            ->execute();

        $keys = [];
        foreach ($labeledThingIds as $labeledThingId) {
            $keys[] = [$labeledThingId['value'], (int) $frameNumber];
        }

        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameNumber')
            ->setKeys($keys)
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
