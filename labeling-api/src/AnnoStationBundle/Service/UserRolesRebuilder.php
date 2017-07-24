<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;

class UserRolesRebuilder
{
    const LABELGROUP_PREFIX = 'label-group-member-';
    const COORDINATORS_PREFIX = 'coordinator-for-organisation-project-';
    const ADMIN_GROUP_PREFIX = 'admin-group-';
    const OBSERVER_GROUP_PREFIX = 'observer-group-';
    const SUPER_ADMIN_GROUP = 'super-admin-group';

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var AppBundleFacade\CouchDbUsers
     */
    private $couchDbUsersFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @param Facade\LabelingGroup         $labelingGroupFacade
     * @param Facade\Project               $projectFacade
     * @param Facade\Organisation          $organisationFacade
     * @param AppBundleFacade\CouchDbUsers $couchDbUsersFacade
     */
    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\Project $projectFacade,
        Facade\Organisation $organisationFacade,
        AppBundleFacade\CouchDbUsers $couchDbUsersFacade
    ) {
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->couchDbUsersFacade  = $couchDbUsersFacade;
        $this->projectFacade       = $projectFacade;
        $this->organisationFacade = $organisationFacade;
    }

    /**
     * @param Model\User $user
     */
    public function rebuildForUser(Model\User $user)
    {
        $labelingGroups = $this->labelingGroupFacade->findAllByUser($user);
        $roles          = array_map(
            function (Model\LabelingGroup $labelingGroup) {
                return sprintf('%s%s', self::LABELGROUP_PREFIX, $labelingGroup->getId());
            },
            $labelingGroups
        );

        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
            foreach ($user->getOrganisations() as $organisationId) {
                $organisation = $this->organisationFacade->find($organisationId);
                $assignedProjects = $this->projectFacade->findAllForCoordinator($organisation, $user)->toArray();
                /** @var Model\Project $assignedProject */
                foreach ($assignedProjects as $assignedProject) {
                    $roles[] = sprintf(
                        '%s%s-%s',
                        UserRolesRebuilder::COORDINATORS_PREFIX,
                        $assignedProject->getOrganisationId(),
                        $assignedProject->getId()
                    );
                }
            }
        }

        if ($user->hasRole(Model\User::ROLE_ADMIN)) {
            foreach ($user->getOrganisations() as $organisation) {
                $roles[] = sprintf('%s%s', self::ADMIN_GROUP_PREFIX, $organisation);
            }
        }

        if ($user->hasRole(Model\User::ROLE_OBSERVER)) {
            foreach ($user->getOrganisations() as $organisation) {
                $roles[] = sprintf('%s%s', self::OBSERVER_GROUP_PREFIX, $organisation);
            }
        }

        if ($user->hasRole(Model\User::ROLE_SUPER_ADMIN)) {
            $roles[] = self::SUPER_ADMIN_GROUP;
        }
        sort($roles);

        $this->couchDbUsersFacade->updateUser(
            sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $user->getUsername()),
            $user->getCouchDbPassword(),
            $roles
        );
    }
}
