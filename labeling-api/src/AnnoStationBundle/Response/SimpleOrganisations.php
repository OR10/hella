<?php

namespace AnnoStationBundle\Response;

use AnnoStationBundle\Model;
use AnnoStationBundle\Database\Facade;

class SimpleOrganisations
{
    /**
     * @var Model\Organisation[]
     */
    private $result = [];

    /**
     * @param array               $organisations
     * @param Facade\Organisation $organisationFacade
     */
    public function __construct(
        $organisations,
        Facade\Organisation $organisationFacade
    ) {
        $this->result = array_map(function (Model\Organisation $organisation) use ($organisationFacade) {
            return [
                'id' => $organisation->getId(),
                'name' => $organisation->getName(),
                'quota' => $organisation->getQuota(),
                'diskUsage' => $organisationFacade->getDiskUsageForOrganisation($organisation),
            ];
        }, $organisations);
    }
}
