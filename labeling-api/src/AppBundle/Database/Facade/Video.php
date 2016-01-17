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
            ->createQuery('annostation_video', 'by_id')
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

    /**
     * @param string[] $ids
     *
     * @return Video[]
     */
    public function findById(array $ids)
    {
        return $this->documentManager
            ->createQuery('annostation_video', 'by_id')
            ->setKeys($ids)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * Get all Videos for the given tasks indexed by the id of the video.
     *
     * @param LabelingTask[] $tasks
     *
     * @return Video[]
     */
    public function findAllForTasksIndexedById(array $tasks)
    {
        $videoIds = array_values(
            array_unique(
                array_map(
                    function(Model\LabelingTask $task) {
                        return $task->getVideoId();
                    },
                    $tasks
                )
            )
        );

        if (empty($videoIds)) {
            return [];
        }

        foreach ($this->findById($videoIds) as $video) {
            $videos[$video->getId()] = $video;
        }

        return $videos;
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

    /**
     * @param Model\Video $video
     * @param mixed       $source Resource, filename or content of the video.
     *
     * @return Model\Video
     */
    public function save(Model\Video $video, $source = null)
    {
        $this->documentManager->persist($video);
        $this->documentManager->flush();

        if ($source !== null) {
            if (is_resource($source)) {
                $this->fileSystem->writeStream($video->getSourceVideoPath(), $source);
            } elseif (is_file($source)) {
                if (($stream = fopen($source, 'r+')) === false) {
                    throw new \RuntimeException("File '{$source}' is not readable");
                }
                $this->fileSystem->writeStream($video->getSourceVideoPath(), $stream);
            } elseif (is_string($source)) {
                $this->fileSystem->write($video->getSourceVideoPath(), $source);
            } else {
                throw new \RuntimeException(sprintf('Unsupported source type: %s', gettype($source)));
            }
        }

        return $video;
    }
}
