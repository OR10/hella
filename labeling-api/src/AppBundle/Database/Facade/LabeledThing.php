<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledThing
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
            ->setStartKey([$labeledThing->getId(), $frameRange->getStartFrameIndex()])
            ->setEndKey([$labeledThing->getId(), $frameRange->getEndFrameIndex()])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @return mixed
     */
    public function getIncompleteLabeledThings(Model\LabelingTask $labelingTask)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing', 'incomplete')
            ->setStartKey([$labelingTask->getId(), true])
            ->setEndKey([$labelingTask->getId(), true])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function getLabeledThingsById(array $labeledThingIds)
    {
        $idsInChunks = array_chunk($labeledThingIds, 100);

        $labeledThings = array();
        foreach ($idsInChunks as $idsInChunk) {
            $labeledThings = array_merge(
                $labeledThings,
                $this->documentManager
                    ->createQuery('annostation_labeled_thing', 'by_id')
                    ->setKeys($idsInChunk)
                    ->onlyDocs(true)
                    ->execute()
                    ->toArray()
            );
        }

        return $labeledThings;
    }

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
     * @param $id
     *
     * @return Model\LabeledThing
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabeledThing::class, $id);
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
