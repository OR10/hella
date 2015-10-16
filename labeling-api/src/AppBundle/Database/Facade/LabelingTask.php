<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class LabelingTask
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    public function getVideo(Model\LabelingTask $labelingTask)
    {
        return $this->documentManager->find('AppBundle\Model\Video', $labelingTask->getVideoId());
    }

    public function getLabeledFrames(Model\LabelingTask $labelingTask)
    {
        //TODO: implement
    }

    public function getLabeledThings(Model\LabelingTask $labelingTask)
    {
        //TODO: implement
    }

    public function save(Model\LabelingTask $labelingTask)
    {
        $this->documentManager->persist($labelingTask);
        $this->documentManager->flush();
    }
}