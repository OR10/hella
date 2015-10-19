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

    function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    public function getLabeledThings(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $this->documentManager->find(Model\LabeledThing::class, $labeledThingInFrame->getLabeledThingId());
    }

    public function save(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $this->documentManager->persist($labeledThingInFrame);
        $this->documentManager->flush();
    }
}
