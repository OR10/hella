<?php

namespace AnnoStationBundle\Service;

use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Service;

class TaskDatabaseSecurityPermissionService
{
    const LABELGROUP_PREFIX = 'label-group-member-';

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

    /**
     * @var bool
     */
    private $pouchDbFeatureEnabled;

    public function __construct(
        Facade\Project $projectFacade,
        Facade\Organisation $organisationFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        AppBundleFacade\User $userFacade,
        AppBundleFacade\CouchDbSecurity $couchDbSecurity,
        $pouchDbFeatureEnabled
    ) {
        $this->couchDbSecurity       = $couchDbSecurity;
        $this->projectFacade         = $projectFacade;
        $this->organisationFacade    = $organisationFacade;
        $this->userFacade            = $userFacade;
        $this->labelingGroupFacade   = $labelingGroupFacade;
        $this->pouchDbFeatureEnabled = $pouchDbFeatureEnabled;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function updateSecurityPermissions(Model\LabelingTask $labelingTask)
    {
        if (!$this->pouchDbFeatureEnabled) {
            return;
        }

        $project      = $this->projectFacade->find($labelingTask->getProjectId());
        $organisation = $this->organisationFacade->find($project->getOrganisationId());

        $memberNames = [];
        $memberRoles = [];

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

        $memberNames = array_merge(
            $memberNames,
            $this->getCoordinatorUsernames($project)
        );

        $memberRoles = $this->getLabelingGroupRole($project);

        $this->couchDbSecurity->updateSecurity(
            sprintf(
                Service\TaskDatabaseCreator::TASK_DATABASE_NAME_TEMPLATE,
                $project->getId(),
                $labelingTask->getId()
            ),
            array_values(array_unique($memberNames)),
            $memberRoles
        );
    }

    private function getLabelingGroupRole(Model\Project $project)
    {
        $labelingGroupId = $project->getLabelingGroupId();

        if ($labelingGroupId === null) {
            return [];
        }

        return [
            sprintf(
                '%s%s',
                self::LABELGROUP_PREFIX,
                $labelingGroupId
            ),
        ];
    }

    /**
     * @param Model\Project $project
     *
     * @return array
     */
    private function getCoordinatorUsernames(Model\Project $project)
    {
        $memberNames                     = [];
        $latestAssignedCoordinatorUserId = $project->getLatestAssignedCoordinatorUserId();
        if ($latestAssignedCoordinatorUserId !== null) {
            $memberNames[] = $this->userFacade->getUserById($latestAssignedCoordinatorUserId)
                ->getUsername();
        }

        return $memberNames;
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