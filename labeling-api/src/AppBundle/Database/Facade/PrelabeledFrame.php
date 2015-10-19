<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class PrelabeledFrame
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    public function getVideo(Model\PrelabeledFrame $prelabeledFrame)
    {
        return $this->documentManager->find(Model\Video::class, $prelabeledFrame->getVideoId());
    }

    public function save(Model\PrelabeledFrame $prelabeledFrame)
    {
        $this->documentManager->persist($prelabeledFrame);
        $this->documentManager->flush();
    }
}
