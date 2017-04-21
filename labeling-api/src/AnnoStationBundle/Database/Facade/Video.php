<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Database\Facade\CouchDb as CouchDbBase;
use AppBundle\Model;
use AnnoStationBundle\Service;
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

    /**
     * @var Service\FrameCdn
     */
    private $videoCdnService;

    /**
     * @param CouchDB\DocumentManager $documentManager
     * @param Flysystem\FileSystem    $fileSystem
     * @param Service\VideoCdn        $videoCdnService
     * @Flysystem\FileSystem          $fileSystem
     */
    public function __construct(
        CouchDB\DocumentManager $documentManager,
        Flysystem\FileSystem $fileSystem,
        Service\VideoCdn $videoCdnService
    ) {
        $this->documentManager = $documentManager;
        $this->fileSystem      = $fileSystem;
        $this->videoCdnService = $videoCdnService;
    }

    public function findAll()
    {
        $result = $this->documentManager
            ->createQuery('annostation_video_001', 'by_id')
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
        $idsInChunks = array_chunk($ids, 100);

        $videos = array();
        foreach ($idsInChunks as $idsInChunk) {
            $videos = array_merge(
                $videos,
                $this->documentManager
                    ->createQuery('annostation_video_001', 'by_id')
                    ->setKeys($idsInChunk)
                    ->onlyDocs(true)
                    ->execute()
                    ->toArray()
            );
        }

        return $videos;
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

        $videos = [];
        foreach ($this->findById($videoIds) as $video) {
            $videos[$video->getId()] = $video;
        }

        return $videos;
    }

    /**
     * @param $id
     *
     * @return string
     */
    public function getVideoNameForId($id)
    {
        $video = $this->documentManager
            ->createQuery('annostation_video_001', 'by_id')
            ->setKey($id)
            ->onlyDocs(false)
            ->execute()
            ->toArray();

        if (empty($video)) {
            throw new \RuntimeException(sprintf('VideoId not found "%s"', $id));
        }

        return $video[0]['value'];
    }

    /**
     * Fetch all videos with a certain name
     *
     * @param string $name
     *
     * @return Model\Video[]
     */
    public function fetchAllByName($name)
    {
        return $this->documentManager
            ->createQuery('annostation_video_001', 'by_name')
            ->setKey([$name])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @return Model\Video[]
     */
    public function getAllFailedPreprocessingVideos()
    {
        return $this->documentManager
            ->createQuery('annostation_videos_marked_as_failed', 'view')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @return Model\Video[]
     */
    public function getAllUnconvertedVideos()
    {
        return $this->documentManager
            ->createQuery('annostation_videos_not_converted', 'view')
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function getPrelabeledFrames(Model\Video $video)
    {
        //TODO: implement
    }

    public function getLabelingTasks(Model\Video $video)
    {
        //TODO: implement
    }

    /**
     * @param Model\Video $video
     */
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
            $this->videoCdnService->saveVideo($video, $source);
        }

        return $video;
    }

    /**
     * @param Model\Video $video
     */
    public function delete(Model\Video $video)
    {
        $this->documentManager->remove($video);
        $this->documentManager->flush();
    }

    /**
     * @return array
     */
    public function getNumberOfVideosByOrganisations()
    {
        $query = $this->documentManager
            ->createQuery('annostation_number_of_videos_by_organisationId', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setGroupLevel(1)
            ->execute()
            ->toArray();

        $numberOfVideosByOrganisation = [];
        foreach ($query as $value) {
            $numberOfVideosByOrganisation[$value['key'][0]] = $value['value'];
        }

        return $numberOfVideosByOrganisation;
    }
}
