<?php
namespace AppBundle\Database\Facade;

use AppBundle\Database\Facade\CouchDb as CouchDbBase;
use AppBundle\Model;
use Doctrine\ODM\CouchDB;
use League\Flysystem;

class Video
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @var Flysystem\FileSystem
     */
    private $fileSystem;

    public function __construct(
        CouchDB\DocumentManager $documentManager,
        Flysystem\FileSystem $fileSystem
    ) {
        $this->documentManager = $documentManager;
        $this->fileSystem      = $fileSystem;
    }

    public function findAll()
    {
        $result = $this->documentManager
            ->createQuery('labeling_api', 'video')
            ->onlyDocs(true)
            ->execute();

        return $result->toArray();
    }

    /**
     * @param $id
     * @return Model\Video
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\Video::class, $id);
    }

    public function getPrelabeledFrames(Model\Video $video)
    {
        //TODO: implement
    }

    public function getLabelingTasks(Model\Video $video)
    {
        //TODO: implement
    }

    public function refresh(Model\Video $video)
    {
        $this->documentManager->refresh($video);
    }

    public function update()
    {
        $configuration = $this->documentManager->getConfiguration();
        $this->documentManager->flush();
    }

    public function save(Model\Video $video, $stream = null)
    {
        $this->documentManager->persist($video);
        $this->documentManager->flush();

        if ($stream !==  null) {
            $this->fileSystem->writeStream(
                $video->getSourceVideoPath(),
                $stream
            );
        }
    }
}
