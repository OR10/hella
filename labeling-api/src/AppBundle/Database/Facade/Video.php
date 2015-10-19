<?php
namespace AppBundle\Database\Facade;

use AppBundle\Database\Facade\CouchDb as CouchDbBase;
use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class Video
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    public function findAll()
    {
        return $this->documentManager
            ->createQuery('labeling_api', 'video')
            ->onlyDocs(true)
            ->execute();
    }

    public function getPrelabeledFrames(Model\Video $video)
    {
        //TODO: implement
    }

    public function getLabelingTasks(Model\Video $video)
    {
        //TODO: implement
    }

    public function save(Model\Video $videoModel)
    {
        $this->documentManager->persist($videoModel);
        $this->documentManager->flush();
    }
}
