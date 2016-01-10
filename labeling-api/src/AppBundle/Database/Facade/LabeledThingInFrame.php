<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledThingInFrame
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
     *
     * @return Model\LabeledThingInFrame
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabeledThingInFrame::class, $id);
    }

    public function save(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        if ($labeledThingInFrame->getId() === null) {
            $uuids = $this->documentManager->getCouchDBClient()->getUuids();
            if (!is_array($uuids) || empty($uuids)) {
                throw new \RuntimeException("Error retrieving uuid for LabeledThingInFrame");
            }
            $labeledThingInFrame->setId($uuids[0]);
        }

        $this->documentManager->persist($labeledThingInFrame);
        $this->documentManager->flush();
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrame
     */
    public function saveAll(array $labeledThingsInFrame) {
        $numberOfMissingIds = array_reduce(
            $labeledThingsInFrame,
            function($numberOfMissingIds, $labeledThingInFrame) {
                if ($labeledThingInFrame->getId() === null) {
                    return $numberOfMissingIds + 1;
                }
                return $numberOfMissingIds;
            },
            0
        );

        $uuids = $numberOfMissingIds > 0 ? $this->documentManager->getCouchDBClient()->getUuids($numberOfMissingIds) : [];

        foreach ($labeledThingsInFrame as $labeledThingInFrame) {
            if ($labeledThingInFrame->getId() === null) {
                $labeledThingInFrame->setId(array_shift($uuids));
            }
            $this->documentManager->persist($labeledThingInFrame);
        }

        $this->documentManager->flush();
    }

    public function getLabeledThingInFramesOutsideRange(Model\LabeledThing $labeledThing)
    {
        $frameRange = $labeledThing->getFrameRange();
        $start      = $frameRange->getStartFrameNumber();
        $end        = $frameRange->getEndFrameNumber();

        $beforeRange = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameNumber')
            ->setStartKey([$labeledThing->getId(), 0])
            ->setEndKey([$labeledThing->getId(), $start - 1])
            ->onlyDocs(true)
            ->execute()
            ->toArray();

        $afterRange = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameNumber')
            ->setStartKey([$labeledThing->getId(), $end + 1])
            ->onlyDocs(true)
            ->execute()
            ->toArray();

        return array_merge($beforeRange, $afterRange);
    }

    public function delete(array $labeledThingInFrames)
    {
        foreach($labeledThingInFrames as $labeledThingInFrame) {
            $this->documentManager->remove($labeledThingInFrame);
        }
        $this->documentManager->flush();
    }
}
