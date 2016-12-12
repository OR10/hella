<?php
namespace AnnoStationBundle\Database\Facade;

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

    /**
     * @param Model\PrelabeledFrame $prelabeledFrame
     *
     * @return Model\Video
     */
    public function getVideo(Model\PrelabeledFrame $prelabeledFrame)
    {
        return $this->documentManager->find(Model\Video::class, $prelabeledFrame->getVideoId());
    }

    /**
     * @param Model\PrelabeledFrame $prelabeledFrame
     */
    public function save(Model\PrelabeledFrame $prelabeledFrame)
    {
        $this->documentManager->persist($prelabeledFrame);
        $this->documentManager->flush();
    }
}
