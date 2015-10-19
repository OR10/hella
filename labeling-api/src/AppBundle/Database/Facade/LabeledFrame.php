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

    function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    public function getLabelingTask(Model\LabeledFrame $labeledFrame)
    {
        return $this->documentManager->find(Model\LabelingTask::class, $labeledFrame->getLabelingTaskId());
    }

    public function save(Model\LabeledFrame $labeledFrame)
    {
        $this->documentManager->persist($labeledFrame);
        $this->documentManager->flush();
    }
}
