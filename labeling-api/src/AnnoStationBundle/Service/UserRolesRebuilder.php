<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;

class UserRolesRebuilder
{
    const LABELGROUP_PREFIX = 'label-group-member-';
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
     * @param Facade\LabelingGroup         $labelingGroupFacade
     * @param AppBundleFacade\CouchDbUsers $couchDbUsersFacade
     */
    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade,
        AppBundleFacade\CouchDbUsers $couchDbUsersFacade
    ) {
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->couchDbUsersFacade  = $couchDbUsersFacade;
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

        $this->couchDbUsersFacade->updateUser(
            sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $user->getUsername()),
            $user->getCouchDbPassword(),
            $roles
        );
    }
}