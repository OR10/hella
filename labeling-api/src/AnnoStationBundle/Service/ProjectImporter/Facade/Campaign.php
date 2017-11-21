<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;

class Campaign
{
    /**
     * @var Facade\Campaign
     */
    private $campaignFacade;

    /**
     * @param Facade\Campaign $campaignFacade
     */
    public function __construct(Facade\Campaign $campaignFacade)
    {
        $this->campaignFacade = $campaignFacade;
    }

    /**
     * @param Model\Campaign $campaign
     *
     * @return Model\Campaign
     */
    public function save(Model\Campaign $campaign)
    {
        return $this->campaignFacade->save($campaign);
    }

    /**
     * @param Model\Organisation $organisation
     * @param                    $name
     *
     * @return mixed
     */
    public function getCampaignByOrganisationAndName(Model\Organisation $organisation, $name)
    {
        return $this->campaignFacade->getCampaignByOrganisationAndName($organisation, $name);
    }
}
