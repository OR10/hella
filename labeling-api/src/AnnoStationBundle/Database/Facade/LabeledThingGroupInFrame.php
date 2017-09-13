<?php
namespace AnnoStationBundle\Database\Facade;

use AnnoStationBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledThingGroupInFrame
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
     * @param string $id
     *
     * @return Model\LabeledThingGroupInFrame
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\LabeledThingGroupInFrame::class, $id);
    }

    /**
     * @param Model\LabeledThingGroupInFrame $labeledThingGroupInFrame
     *
     * @return Model\LabeledThingGroupInFrame
     */
    public function save(Model\LabeledThingGroupInFrame $labeledThingGroupInFrame)
    {
        $this->documentManager->persist($labeledThingGroupInFrame);
        $this->documentManager->flush();

        return $labeledThingGroupInFrame;
    }

    /**
     * @param Model\LabeledThingGroupInFrame $labeledThingGroupInFrame
     */
    public function delete(Model\LabeledThingGroupInFrame $labeledThingGroupInFrame)
    {
        $this->documentManager->remove($labeledThingGroupInFrame);
        $this->documentManager->flush();
    }

    /**
     * @param Model\LabeledThingGroup $labeledThingGroup
     * @return Model\LabeledThingGroupInFrame[]
     */
    public function getLabeledThingGroupInFramesForLabeledThingGroup(Model\LabeledThingGroup $labeledThingGroup)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_thing_group_in_frames_by_labeled_thing_group', 'view')
            ->onlyDocs(true)
            ->setKey([$labeledThingGroup->getId()])
            ->execute()
            ->toArray();
    }
}
