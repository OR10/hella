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

    /**
     * @var string
     */
    private $dataDirectory;

    public function __construct(CouchDB\DocumentManager $documentManager, $dataDirectory)
    {
        $this->documentManager = $documentManager;
        $this->dataDirectory   = $dataDirectory;
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

        $videoDirectory = $this->dataDirectory . DIRECTORY_SEPARATOR . $video->getId();
        if (!mkdir($videoDirectory)) {
            //TODO: implement better error handling
            throw new \Exception("Error creating directory: {$videoDirectory}!");
        }

        if ($filename !== null) {
            if (!copy($filename, $videoDirectory . DIRECTORY_SEPARATOR . 'raw')) {
                //TODO: implement better error handling
                throw new \Exception("Error copying filename as raw data!");
            }
        }
    }
}
