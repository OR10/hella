<?php
namespace AnnoStationBundle\Database\Facade;

use AnnoStationBundle\Model;
use Doctrine\ODM\CouchDB;

class Organisation
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * Organisation constructor.
     *
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param string $id
     *
     * @return Model\Organisation
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\Organisation::class, $id);
    }

    /**
     * @param null $skip
     * @param null $limit
     *
     * @return Model\Organisation[]
     */
    public function findAll($skip = null, $limit = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_organisation_by_id', 'view')
            ->onlyDocs(true);

        if ($skip !== null) {
            $query->setSkip($skip);
        }

        if ($limit !== null) {
            $query->setLimit($limit);
        }

        return $query->execute()->toArray();
    }

    /**
     * @param Model\Organisation $organisation
     *
     * @return Model\Organisation
     */
    public function save(Model\Organisation $organisation)
    {
        $this->documentManager->persist($organisation);
        $this->documentManager->flush();

        return $organisation;
    }

    /**
     * @param Model\Organisation $organisation
     */
    public function delete(Model\Organisation $organisation)
    {
        $this->documentManager->remove($organisation);
        $this->documentManager->flush();
    }

    public function getDiskUsageForOrganisation(Model\Organisation $organisation)
    {
    }

    public function getDiskUsageForOrganisationVideos(Model\Organisation $organisation)
    {
        $imageQuery = $this->documentManager
            ->createQuery('annostation_image_bytes_by_organisationId_type_and_videoId', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setGroupLevel(3)
            ->setStartKey([$organisation->getId(), null])
            ->setEndKey([$organisation->getId(), []]);

        $videoQuery = $this->documentManager
            ->createQuery('annostation_video_bytes_by_organisationId_and_videoId', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setGroupLevel(2)
            ->setStartKey([$organisation->getId(), null])
            ->setEndKey([$organisation->getId(), []]);

        $imageBytesByVideoIds = $imageQuery->execute()->toArray();
        $videoBytesByVideoIds = $videoQuery->execute()->toArray();

        $diskUsageByProject = [];
        $diskUsageByProject['total'] = 0;
        foreach ($imageBytesByVideoIds as $imageBytesByVideoId) {
            $type                                          = $imageBytesByVideoId['key'][1];
            $videoId                                       = $imageBytesByVideoId['key'][2];
            $diskUsageByProject[$videoId]['images'][$type] = $imageBytesByVideoId['value'];
            $diskUsageByProject['total'] += $imageBytesByVideoId['value'];
        }
        foreach ($videoBytesByVideoIds as $videoBytesByVideoId) {
            $videoId                               = $videoBytesByVideoId['key'][1];
            $diskUsageByProject[$videoId]['video']['source'] = $videoBytesByVideoId['value'];
            $diskUsageByProject['total'] += $videoBytesByVideoId['value'];
        }

        return $diskUsageByProject;
    }
}