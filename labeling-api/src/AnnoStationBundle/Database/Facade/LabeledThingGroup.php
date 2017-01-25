<?php
namespace AnnoStationBundle\Database\Facade;

use AnnoStationBundle\Model;
use AppBundle\Model as AppBundle;
use Doctrine\ODM\CouchDB;

class LabeledThingGroup
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
     * @return Model\LabelingGroup
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\LabeledThingGroup::class, $id);
    }

    /**
     * @param Model\LabeledThingGroup $labeledThingGroup
     *
     * @return Model\LabeledThingGroup
     */
    public function save(Model\LabeledThingGroup $labeledThingGroup)
    {
        $this->documentManager->persist($labeledThingGroup);
        $this->documentManager->flush();

        return $labeledThingGroup;
    }

    /**
     * @param Model\LabeledThingGroup $labeledThingGroup
     *
     * @return Model\LabeledThingGroup
     */
    public function delete(Model\LabeledThingGroup $labeledThingGroup)
    {
        $this->documentManager->remove($labeledThingGroup);
        $this->documentManager->flush();

        return $labeledThingGroup;
    }

    /**
     * @param AppBundle\LabelingTask $labelingTask
     * @param                    $frameIndex
     */
    public function getLabeledThingGroupByTaskAndFrameIndex(AppBundle\LabelingTask $labelingTask, $frameIndex)
    {
        $documentManager = $this->documentManager
            ->createQuery('annostation_labeled_thing_group_in_frame_by_taskId_frameIndex', 'view')
            ->onlyDocs(false)
            ->setKey([$labelingTask->getId(), (int) $frameIndex]);

        return $documentManager->execute()->toArray();
    }
}
