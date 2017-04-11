<?php

namespace AnnoStationBundle\Service;

use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;

class ValidateTaskAccessRights
{
    /**
     * @var AppBundleFacade\CouchDbSecurity
     */
    private $couchDbSecurity;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    public function __construct(
        Facade\Project $projectFacade,
        Facade\Organisation $organisationFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        AppBundleFacade\User $userFacade,
        AppBundleFacade\CouchDbSecurity $couchDbSecurity
    ) {
        $this->couchDbSecurity     = $couchDbSecurity;
        $this->projectFacade       = $projectFacade;
        $this->organisationFacade  = $organisationFacade;
        $this->userFacade          = $userFacade;
        $this->labelingGroupFacade = $labelingGroupFacade;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function validate(Model\LabelingTask $labelingTask)
    {
        $project      = $this->projectFacade->find($labelingTask->getProjectId());
        $organisation = $this->organisationFacade->find($project->getOrganisationId());

        $memberNames = [];

        $memberNames = array_merge(
            $memberNames,
            $this->getAllowedUsernamesForRole($organisation, Model\User::ROLE_ADMIN)
        );
        $memberNames = array_merge(
            $memberNames,
            $this->getAllowedUsernamesForRole($organisation, Model\User::ROLE_OBSERVER)
        );
        $memberNames = array_merge(
            $memberNames,
            $this->getAllowedSuperAdminUsernames()
        );

        $memberNames[] = $this->userFacade->getUserById($project->getLatestAssignedCoordinatorUserId())->getUsername();

        $labelingGroupId = $project->getLabelingGroupId();
        if ($labelingGroupId !==  null) {
            $labelingGroup = $this->labelingGroupFacade->find($labelingGroupId);
            foreach ($labelingGroup->getLabeler() as $userId) {
                $memberNames[] = $this->userFacade->getUserById($userId)->getUsername();
            }
        }

        $this->couchDbSecurity->updateSecurity(
            sprintf(Service\TaskDatabaseCreator::TASK_DATABASE_NAME_TEMPLATE, $project->getId(), $labelingTask->getId()),
            $memberNames
        );
    }

    /**
     * @return array
     */
    private function getAllowedSuperAdminUsernames()
    {
        return array_map(
            function (Model\User $user) {
                return $user->getUsername();
            },
            $this->userFacade->getUsersByRole(Model\User::ROLE_SUPER_ADMIN)->toArray()
        );
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $role
     *
     * @return array
     */
    private function getAllowedUsernamesForRole(AnnoStationBundleModel\Organisation $organisation, $role)
    {
        return array_map(
            function (Model\User $user) {
                return $user->getUsername();
            },
            $this->userFacade->getUsersByOrganisationAndRole($organisation, $role)->toArray()
        );
    }
}