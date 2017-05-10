<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledThing
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
     * @param Model\LabeledThing $labeledThing
     * @param int|null           $frameIndex
     * @param int                $offset
     * @param int                $limit
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function getLabeledThingInFrames(
        Model\LabeledThing $labeledThing,
        $frameIndex = null,
        $offset = 0,
        $limit = 0
    ) {
        $frameRange = $labeledThing->getFrameRange();

        if ($frameIndex !== null) {
            $frameRange = $frameRange->createSubRangeForOffsetAndLimit(
                $frameIndex - $frameRange->getStartFrameIndex() + $offset,
                $limit
            );
        }

        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameIndex')
            ->onlyDocs(true)
            ->setStartKey([$labeledThing->getId(), $frameRange->getStartFrameIndex()])
            ->setEndKey([$labeledThing->getId(), $frameRange->getEndFrameIndex()])
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @return array
     */
    public function getIncompleteLabeledThings(Model\LabelingTask $labelingTask)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing', 'incomplete')
            ->onlyDocs(true)
            ->setStartKey([$labelingTask->getId(), true])
            ->setEndKey([$labelingTask->getId(), true])
            ->execute()
            ->toArray();
    }

    /**
     * @param string[] $labeledThingIds
     *
     * @return Model\LabeledThing[]
     */
    public function getLabeledThingsById(array $labeledThingIds)
    {
        $idsInChunks = array_chunk($labeledThingIds, 100);

        $labeledThings = array();
        foreach ($idsInChunks as $idsInChunk) {
            $labeledThings = array_merge(
                $labeledThings,
                $this->documentManager
                    ->createQuery('annostation_labeled_thing', 'by_id')
                    ->onlyDocs(true)
                    ->setKeys($idsInChunk)
                    ->execute()
                    ->toArray()
            );
        }

        return $labeledThings;
    }

    /**
     * @param Model\LabeledThing $labeledThing
     *
     * @return Model\LabeledThing
     */
    public function save(Model\LabeledThing $labeledThing)
    {
        if ($labeledThing->getId() === null) {
            $uuids = $this->documentManager->getCouchDBClient()->getUuids();
            if (!is_array($uuids) || empty($uuids)) {
                throw new \RuntimeException("Error retrieving uuid for LabeledThing");
            }
            $labeledThing->setId($uuids[0]);
        }

        $this->documentManager->persist($labeledThing);
        $this->documentManager->flush();

        return $labeledThing;
    }

    /**
     * @param string $id
     *
     * @return Model\LabeledThing
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\LabeledThing::class, $id);
    }

    /**
     * @return Model\LabeledThing[]
     */
    public function findAll()
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing', 'by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @return Model\LabeledThing[]
     */
    public function findByTaskId(Model\LabelingTask $task)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing', 'by_taskId')
            ->setKey($task->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabeledThing $labeledThing
     */
    public function delete(Model\LabeledThing $labeledThing)
    {
        $this->documentManager->remove($labeledThing);
        $this->documentManager->flush();
    }
}
