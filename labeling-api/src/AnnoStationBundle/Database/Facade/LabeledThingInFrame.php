<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledThingInFrame
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
     *
     * @return Model\LabeledThingInFrame
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabeledThingInFrame::class, $id);
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Model\LabeledThingInFrame
     */
    public function save(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        if ($labeledThingInFrame->getId() === null) {
            $labeledThingInFrame->setId($this->getUuids(1)[0]);
        }

        $this->documentManager->persist($labeledThingInFrame);
        $this->documentManager->flush();

        return $labeledThingInFrame;
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingsInFrame
     */
    public function saveAll(array $labeledThingsInFrame)
    {
        $numberOfMissingIds = array_reduce(
            $labeledThingsInFrame,
            function ($numberOfMissingIds, Model\LabeledThingInFrame $labeledThingInFrame) {
                if ($labeledThingInFrame->getId() === null) {
                    return $numberOfMissingIds + 1;
                }

                return $numberOfMissingIds;
            },
            0
        );

        $uuids = $this->getUuids($numberOfMissingIds);

        foreach ($labeledThingsInFrame as $labeledThingInFrame) {
            if ($labeledThingInFrame->getId() === null) {
                $labeledThingInFrame->setId(array_shift($uuids));
            }
            $this->documentManager->persist($labeledThingInFrame);
        }

        $this->documentManager->flush();
    }

    /**
     * @param Model\LabeledThing $labeledThing
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function getLabeledThingInFramesOutsideRange(Model\LabeledThing $labeledThing)
    {
        $frameRange = $labeledThing->getFrameRange();
        $start      = $frameRange->getStartFrameIndex();
        $end        = $frameRange->getEndFrameIndex();

        $beforeRange = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameIndex')
            ->onlyDocs(true)
            ->setStartKey([$labeledThing->getId(), 0])
            ->setEndKey([$labeledThing->getId(), $start - 1])
            ->execute()
            ->toArray();

        $afterRange = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameIndex')
            ->onlyDocs(true)
            ->setStartKey([$labeledThing->getId(), $end + 1])
            ->execute()
            ->toArray();

        return array_merge($beforeRange, $afterRange);
    }

    /**
     * @param Model\LabeledThingInFrame[] $labeledThingInFrames
     */
    public function delete(array $labeledThingInFrames)
    {
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            $this->documentManager->remove($labeledThingInFrame);
        }
        $this->documentManager->flush();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param int                $limit
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function getLabeledThingsInFrame(Model\LabelingTask $labelingTask, int $limit = 0)
    {
        $documentManager = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_taskId')
            ->onlyDocs(true)
            ->setKey($labelingTask->getId());

        if ($limit > 0) {
            $documentManager->setLimit($limit);
        }

        return $documentManager->execute()->toArray();
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param int                $limit
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function getIncompleteLabeledThingsInFrame(Model\LabelingTask $labelingTask, $limit = 0)
    {
        $documentManager = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'incomplete')
            ->onlyDocs(true)
            ->setStartKey([$labelingTask->getId(), true])
            ->setEndKey([$labelingTask->getId(), true]);

        if ($limit > 0) {
            $documentManager->setLimit($limit);
        }

        return $documentManager->execute()->toArray();
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function getPreviousLabeledThingInFrameWithClasses(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $result = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'by_labeledThingId_frameIndex_count_by_classes')
            ->onlyDocs(true)
            ->setEndKey([$labeledThingInFrame->getLabeledThingId(), 0, 1])
            ->setStartKey([$labeledThingInFrame->getLabeledThingId(), $labeledThingInFrame->getFrameIndex(), '*'])
            ->setLimit(1)
            ->setDescending(true)
            ->execute()
            ->toArray();

        if (empty($result)) {
            return null;
        }

        return $result[0];
    }

    /**
     * @param Model\Project $project
     *
     * @return int
     */
    public function getSumOfLabeledThingInFramesByProject(Model\Project $project)
    {
        $query = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame', 'sum_by_project')
            ->setReduce(true)
            ->setKey($project->getId())
            ->execute()
            ->toArray();

        if (isset($query[0]['value'])) {
            return $query[0]['value'];
        }

        return 0;
    }

    /**
     * @param $projects
     *
     * @return array
     */
    public function getSumOfLabeledThingInFramesByProjects($projects)
    {
        $projectIds = array_map(
            function (Model\Project $project) {
                return $project->getId();
            },
            $projects
        );

        $idsInChunks = array_chunk($projectIds, 100);

        $numberOfLabeledThingInFramesByProjects = [];
        foreach ($idsInChunks as $idsInChunk) {
            $numberOfLabeledThingInFramesByProjects = array_merge(
                $numberOfLabeledThingInFramesByProjects,
                $this->documentManager
                    ->createQuery('annostation_labeled_thing_in_frame', 'sum_by_project')
                    ->setReduce(true)
                    ->setGroup(true)
                    ->setKeys($idsInChunk)
                    ->execute()
                    ->toArray()
            );
        }

        $response = [];
        foreach ($numberOfLabeledThingInFramesByProjects as $numberOfLabeledThingInFramesByProject) {
            $response[$numberOfLabeledThingInFramesByProject['key']] = $numberOfLabeledThingInFramesByProject['value'];
        }

        return $response;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return int
     */
    public function getMaxLabeledThingInFrameImportLineNoForTask(Model\LabelingTask $labelingTask)
    {
        $documentManager = $this->documentManager
            ->createQuery('annostation_labeled_thing_in_frame_import_line_number_001', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setGroupLevel(1)
            ->setStartKey([$labelingTask->getId(), null])
            ->setEndKey([$labelingTask->getId(), []]);

        $response = $documentManager->execute()->toArray();

        if (empty($response)) {
            return -1;
        }

        return $response[0]['value'];
    }

    /**
     * Get a number of uuids.
     *
     * @param int $count
     *
     * @return array
     */
    private function getUuids(int $count)
    {
        if ($count <= 0) {
            return [];
        }

        $uuids = $this->documentManager->getCouchDBClient()->getUuids($count);

        if (!is_array($uuids) || empty($uuids)) {
            throw new \RuntimeException("Error retrieving uuid for LabeledThingInFrame");
        }

        return $uuids;
    }
}
