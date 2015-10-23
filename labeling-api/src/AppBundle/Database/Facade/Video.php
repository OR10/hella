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
     * @var string
     */
    private $dataDirectory;

    /**
     * @var Flysystem\FileSystem
     */
    private $fileSystem;

    public function __construct(
        CouchDB\DocumentManager $documentManager,
        $dataDirectory,
        Flysystem\FileSystem $fileSystem
    ) {
        $this->documentManager = $documentManager;
        $this->dataDirectory   = $dataDirectory;
        $this->fileSystem      = $fileSystem;
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

    public function save(Model\Video $video, $filename = null)
    {
        $this->documentManager->persist($video);
        $this->documentManager->flush();

        if (!$this->fileSystem->createDir($video->getId() . DIRECTORY_SEPARATOR . 'source')) {
            //TODO: implement better error handling
            throw new \Exception("Error creating directory: {$video->getId()}!");
        }

        if ($filename !== null) {
            $this->fileSystem->write(
                $video->getId() . DIRECTORY_SEPARATOR . 'source' . DIRECTORY_SEPARATOR . basename($filename),
                file_get_contents($filename)
            );
        }
    }
}
