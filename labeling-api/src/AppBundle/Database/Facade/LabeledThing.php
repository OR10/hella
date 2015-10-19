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

    function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    public function getLabeledThingInFrames(Model\LabeledThing $labeledThing)
    {
        //TODO: implement
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
}
