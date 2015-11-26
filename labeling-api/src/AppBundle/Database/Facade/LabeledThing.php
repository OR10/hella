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
     * @param null               $frameNumber
     * @param int                $offset
     * @param int                $limit
     * @return CouchDB\View\Result
     */
    public function getLabeledThingInFrames(
        Model\LabeledThing $labeledThing,
        $frameNumber = null,
        $offset = 0,
        $limit = 0
    ) {
        if ($frameNumber !== null) {
            $startKey = array(
                $labeledThing->getId(),
                $frameNumber + $offset
            );
            $endKey = array(
                $labeledThing->getId(),
                ($frameNumber + $offset) + $limit
            );

        }else{
            $startKey = array(
                $labeledThing->getId(),
                0
            );
            $endKey = array(
                $labeledThing->getId(),
                array()
            );
        }

        return $this->documentManager
            ->createQuery('labeling_api', 'labeled_thing_in_frame')
            ->setStartKey($startKey)
            ->setEndKey($endKey)
            ->onlyDocs(true)
            ->execute();
    }

    public function getlabelingTasks(Model\LabeledThing $labeledThing)
    {
        $this->documentManager->find(Model\LabelingTask::class, $labeledThing->getLabelingTaskId());
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
