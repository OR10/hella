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
     * @param array $ids
     *
     * @return Model\Organisation[]
     */
    public function findByIds(array $ids)
    {
        $query = $this->documentManager
            ->createQuery('annostation_organisation_by_id', 'view')
            ->setKeys($ids)
            ->onlyDocs(true);

        return $query->execute()->toArray();
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

    /**
     * @param Model\Organisation $organisation
     *
     * @return array
     */
    public function getDiskUsageForOrganisation(Model\Organisation $organisation)
    {
        $imageQuery = $this->documentManager
            ->createQuery('annostation_image_bytes_by_organisationId_type_and_videoId', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setGroupLevel(2)
            ->setStartKey([$organisation->getId(), null])
            ->setEndKey([$organisation->getId(), []]);
        $videoQuery = $this->documentManager
            ->createQuery('annostation_video_bytes_by_organisationId_and_videoId', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setGroupLevel(1)
            ->setStartKey([$organisation->getId(), null])
            ->setEndKey([$organisation->getId(), []]);

        $bytesForImagesByOrganisationAndTypes = $imageQuery->execute()->toArray();
        $bytesForVideosInOrganisation         = $videoQuery->execute()->toArray();

        $diskUsage          = [];
        $diskUsage['total'] = 0;
        foreach ($bytesForImagesByOrganisationAndTypes as $bytesForImagesByOrganisationAndType) {
            $type                       = $bytesForImagesByOrganisationAndType['key'][1];
            $diskUsage['images'][$type] = $bytesForImagesByOrganisationAndType['value'];
            $diskUsage['total'] += $bytesForImagesByOrganisationAndType['value'];
        }
        foreach ($bytesForVideosInOrganisation as $bytesForVideoInOrganisation) {
            $diskUsage['videos'] = $bytesForVideoInOrganisation['value'];
            $diskUsage['total'] += $bytesForVideoInOrganisation['value'];
        }

        return $diskUsage;
    }

    /**
     * @param Model\Organisation $organisation
     *
     * @return array
     */
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
            if (!isset($diskUsageByProject[$videoId]['total'])) {
                $diskUsageByProject[$videoId]['total'] = 0;
            }
            $diskUsageByProject[$videoId]['images'][$type] = $imageBytesByVideoId['value'];
            $diskUsageByProject[$videoId]['total'] += $imageBytesByVideoId['value'];
            $diskUsageByProject['total'] += $imageBytesByVideoId['value'];
        }
        foreach ($videoBytesByVideoIds as $videoBytesByVideoId) {
            $videoId                                         = $videoBytesByVideoId['key'][1];
            if (!isset($diskUsageByProject[$videoId]['total'])) {
                $diskUsageByProject[$videoId]['total'] = 0;
            }
            $diskUsageByProject[$videoId]['video']['source'] = $videoBytesByVideoId['value'];
            $diskUsageByProject[$videoId]['total'] += $videoBytesByVideoId['value'];
            $diskUsageByProject['total'] += $videoBytesByVideoId['value'];
        }

        return $diskUsageByProject;
    }

    /**
     * @param Model\Organisation $organisation
     *
     * @return bool
     */
    public function isQuoteExceeded(Model\Organisation $organisation)
    {
        $usage = $this->getDiskUsageForOrganisation($organisation);

        return ($organisation->getQuota() !== 0 && $usage['total'] >= $organisation->getQuota());
    }
}
