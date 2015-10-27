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
        $this->documentManager->persist($labeledThingInFrame);
        $this->documentManager->flush();
    }

    public function delete(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $this->documentManager->remove($labeledThingInFrame);
        $this->documentManager->flush();
    }
}
