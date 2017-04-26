<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledFrame
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param $id
     * @return Model\LabeledFrame
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabeledFrame::class, $id);
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     *
     * @return Model\LabeledFrame
     */
    public function save(Model\LabeledFrame $labeledFrame)
    {
        if ($labeledFrame->getId() === null) {
            $uuids = $this->documentManager->getCouchDBClient()->getUuids();
            if (!is_array($uuids) || empty($uuids)) {
                throw new \RuntimeException("Error retrieving uuid for LabeledFrame");
            }
            $labeledFrame->setId($uuids[0]);
        }

        $this->documentManager->persist($labeledFrame);
        $this->documentManager->flush();

        return $labeledFrame;
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     */
    public function delete(Model\LabeledFrame $labeledFrame)
    {
        $this->documentManager->remove($labeledFrame);
        $this->documentManager->flush();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param                    $start
     *
     * @return null|Model\LabeledFrame
     */
    public function getNextLabeledFrameFromFrameIndex(Model\LabelingTask $labelingTask, $start)
    {
        $result = $this->documentManager
            ->createQuery('annostation_labeled_frame', 'by_taskId_frameIndex')
            ->onlyDocs(true)
            ->setStartKey([$labelingTask->getId(), $start + 1])
            ->setEndKey([$labelingTask->getId(), '*'])
            ->setLimit(1)
            ->setDescending(false)
            ->execute()
            ->toArray();

        if (empty($result)) {
            return null;
        }

        return $result[0];
    }
}
