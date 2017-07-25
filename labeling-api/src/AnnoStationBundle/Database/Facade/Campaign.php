<?php

namespace AnnoStationBundle\Database\Facade;

use AnnoStationBundle\Model;
use Doctrine\ODM\CouchDB;

class Campaign
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param Model\Organisation $organisation
     */
    public function getCampaignByOrganisation(Model\Organisation $organisation)
    {
        return $this->documentManager
            ->createQuery('annostation_campaign_by_organisation_and_name', 'view')
            ->onlyDocs(true)
            ->setStartKey([$organisation->getId(), null])
            ->setEndKey([$organisation->getId(), []])
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\Organisation $organisation
     * @param                    $name
     */
    public function getCampaignByOrganisationAndName(Model\Organisation $organisation, $name)
    {
        return $this->documentManager
            ->createQuery('annostation_campaign_by_organisation_and_name', 'view')
            ->onlyDocs(true)
            ->setKey([$organisation->getId(), $name])
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\Campaign $campaign
     *
     * @return Model\Campaign
     */
    public function save(Model\Campaign $campaign)
    {
        $this->documentManager->persist($campaign);
        $this->documentManager->flush();

        return $campaign;
    }

    /**
     * @param string $id
     *
     * @return Model\Campaign
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\Campaign::class, $id);
    }
}
