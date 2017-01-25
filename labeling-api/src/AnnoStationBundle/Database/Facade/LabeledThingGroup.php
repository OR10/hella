<?php
namespace AnnoStationBundle\Database\Facade;

use AnnoStationBundle\Model;
use AppBundle\Model as AppBundleModel;
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
     * @return Model\LabeledThingGroup
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
     * @param AppBundleModel\LabelingTask $labelingTask
     * @param                             $frameIndex
     */
    public function getLabeledThingGroupByTaskAndFrameIndex(AppBundleModel\LabelingTask $labelingTask, $frameIndex)
    {
        $documentManager = $this->documentManager
            ->createQuery('annostation_labeled_thing_group_in_frame_by_taskId_frameIndex', 'view')
            ->onlyDocs(false)
            ->setKey([$labelingTask->getId(), (int) $frameIndex]);

        return $documentManager->execute()->toArray();
    }

    /**
     * @param Model\LabeledThingGroup $labeledThingGroup
     *
     * @return array
     */
    public function getLabeledThingGroupFrameRange(Model\LabeledThingGroup $labeledThingGroup)
    {
        $response = $this->documentManager
            ->createQuery('annostation_labeled_thing_group_frame_range', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setKey($labeledThingGroup->getId())
            ->execute()
            ->toArray();

        return [
            'min' => $response[0]['value'][0],
            'max' => $response[0]['value'][1],
        ];
    }

    /**
     * @param Model\LabeledThingGroup $labeledThingGroup
     *
     * @return bool
     */
    public function isLabeledThingGroupIncomplete(Model\LabeledThingGroup $labeledThingGroup)
    {
        $response = $this->documentManager
            ->createQuery('annostation_labeled_thing_group_incomplete_sum', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setKey([$labeledThingGroup->getId(), true])
            ->execute()
            ->toArray();

        return (count($response) > 0);
    }
}
