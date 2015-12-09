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
     * @param int|null           $frameNumber
     * @param int                $offset
     * @param int                $limit
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function getLabeledThingInFrames(
        Model\LabeledThing $labeledThing,
        $frameNumber = null,
        $offset = 0,
        $limit = 0
    ) {
        $frameRange = $labeledThing->getFrameRange();

        if ($frameNumber !== null) {
            $frameRange = $frameRange->createSubRangeForOffsetAndLimit(
                $frameNumber - $frameRange->getStartFrameNumber() + $offset,
                $limit
            );
        }

        return $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameNumber')
            ->setStartKey([$labeledThing->getId(), $frameRange->getStartFrameNumber()])
            ->setEndKey([$labeledThing->getId(), $frameRange->getEndFrameNumber()])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function getLabeledThingsById(array $labeledThingIds)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing', 'by_id')
            ->setKeys($labeledThingIds)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
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
