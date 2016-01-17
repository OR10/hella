<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabeledFrame
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
     * @return Model\LabeledFrame
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\LabeledFrame::class, $id);
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     */
    public function save(Model\LabeledFrame $labeledFrame)
    {
        if ($labeledFrame->getId() === null) {
            $uuids = $this->documentManager->getCouchDBClient()->getUuids();
            if (!is_array($uuids) || empty($uuids)) {
                throw new \RuntimeException("Error retrieving uuid for LabeledFrame");
            }
            $labeledFrame->setId($uuids[0]);
        }

        $this->documentManager->persist($labeledFrame);
        $this->documentManager->flush();

        return $labeledFrame;
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     */
    public function delete(Model\LabeledFrame $labeledFrame)
    {
        $this->documentManager->remove($labeledFrame);
        $this->documentManager->flush();
    }
}
