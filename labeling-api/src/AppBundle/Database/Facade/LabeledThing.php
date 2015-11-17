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

    public function getLabeledThingInFrames(Model\LabeledThing $labeledThing)
    {
        return $this->documentManager
            ->createQuery('labeling_api', 'labeled_thing_in_frame')
            ->setStartKey($labeledThing->getId())
            ->setEndKey($labeledThing->getId())
            ->onlyDocs(true)
            ->execute();
    }

    public function getlabelingTasks(Model\LabeledThing $labeledThing)
    {
        $this->documentManager->find(Model\LabelingTask::class, $labeledThing->getLabelingTaskId());
    }

    public function save(Model\LabeledThing $labeledThing)
    {
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
