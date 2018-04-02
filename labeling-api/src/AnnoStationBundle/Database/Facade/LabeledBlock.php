<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledBlock
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
     * @param Model\LabeledBlock $labeledBlock
     * @return Model\LabeledBlock
     */
    public function save(Model\LabeledBlock $labeledBlock)
    {
        $this->documentManager->getDatabase();

        if ($labeledBlock->getId() === null) {
            $uuids = $this->documentManager->getCouchDBClient()->getUuids();
            if (!is_array($uuids) || empty($uuids)) {
                throw new \RuntimeException("Error retrieving uuid for LabeledThing");
            }
            $labeledBlock->setId($uuids[0]);
        }

        $this->documentManager->persist($labeledBlock);
        $this->documentManager->flush();

        return ($labeledBlock->getId() === null) ? null : $labeledBlock->getId() ;
    }

    /**
     * @param string $id
     * @return object
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\LabeledBlock::class, $id);
    }

    /**
     * @return Model\LabeledThing[]
     */
    public function findAll()
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_block', 'by_id')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * get all mark blocked areas in frame
     * @param $blockFrameIds
     * @return array
     */
    public function findLabeledBlockInFrame($blockFrameIds)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_block', 'by_id')
            ->setKeys($blockFrameIds)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabeledBlock $task
     * @return mixed
     */
    public function findByTaskId(Model\LabeledBlock $task)
    {
        return $this->documentManager
            ->createQuery('annostation_labeled_block', 'by_taskId')
            ->setKey($task->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\LabeledBlock $labeledThing
     */
    public function delete(Model\LabeledBlock $labeledThing)
    {
        $this->documentManager->remove($labeledThing);
        $this->documentManager->flush();
    }
}