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
     * @param                     $numberOfVideosByOrganisations
     * @param                     $numberOfProjectsByOrganisations
     * @param Facade\Organisation $organisationFacade
     */
    public function __construct(
        $organisations,
        $numberOfVideosByOrganisations,
        $numberOfProjectsByOrganisations,
        Facade\Organisation $organisationFacade
    ) {
        $this->result = array_map(
            function (Model\Organisation $organisation) use (
                $organisationFacade,
                $numberOfVideosByOrganisations,
                $numberOfProjectsByOrganisations
            ) {
                return [
                    'id'               => $organisation->getId(),
                    'rev'              => $organisation->getRev(),
                    'name'             => $organisation->getName(),
                    'quota'            => $organisation->getQuota(),
                    'userQuota'        => $organisation->getUserQuota(),
                    'diskUsage'        => $organisationFacade->getDiskUsageForOrganisation($organisation),
                    'numberOfVideos'   => isset(
                        $numberOfVideosByOrganisations[$organisation->getId()]
                    ) ? $numberOfVideosByOrganisations[$organisation->getId()] : 0,
                    'numberOfProjects' => isset(
                        $numberOfProjectsByOrganisations[$organisation->getId()]
                    ) ? $numberOfProjectsByOrganisations[$organisation->getId()] : 0,
                ];
            },
            $organisations
        );
    }
}
