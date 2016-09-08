<?php

namespace AppBundle\Service\Authentication;

use AppBundle\Model;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * Service to retrieve permissions for currently loggedin user
 */
class UserPermissions
{
    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var null|Model\User
     */
    private $user;

    /**
     * @var null|\Symfony\Component\Security\Core\Authentication\Token\TokenInterface
     */
    private $token;

    /**
     * CurrentUserPermission constructor.
     *
     * @param Storage\TokenStorage $tokenStorage
     */
    public function __construct(Storage\TokenStorage $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    /**
     * Retrieve a list of all available permissions.
     *
     * By default all permissions must be `false`.
     *
     * @return array
     */
    private function getPermissionDefaults()
    {
        return array(
            'canViewStatsButton'         => false,
            'canViewUserListButton'      => false,
            'canUploadNewVideo'          => false,
            'canViewReopenButton'        => false,
            'unassignPermission'         => false,
            'canViewProjectButton'       => false,
            'canDeleteProject'           => false,
            'canCreateNewProject'        => false,
            'canAcceptProject'           => false,
            'canReopenProject'           => false,
            'canExportProject'           => false,
            'canViewProjectReport'       => false,
            'canMoveProjectToDone'       => false,
            'canReopenTask'              => false,
            'canViewTaskList'            => false,
            'canViewClosedProjects'      => false,
            'canViewTodoProjects'        => false,
            'canEditLabelingGroups'      => false,
            'canAssignProject'           => false,
            'canUploadTaskConfiguration' => false,
            'canCreateProject'           => false,
        );
    }

    private function applyLabelerPermissions($permissions)
    {
        return array_merge(
            $permissions,
            array(
                'canViewTaskList' => true,
            )
        );
    }

    private function applyLabelCoordinatorPermissions($permissions)
    {
        return array_merge(
            $permissions,
            array(
                'canViewStatsButton'           => true,
                'canViewProjectButton'         => true,
                'canViewReopenButton'          => true,
                'unassignPermission'           => true,
                'canExportProject'             => true,
                'canReopenTask'                => true,
                'canViewClosedProjects'        => true,
                'canViewTodoProjects'          => true,
                'canAcceptProject'             => true,
                'canViewTaskList'              => true,
                'canMoveFinishedProjectToDone' => true,
                'canDeleteProject'             => true,
                'canCreateNewProject'          => true,
                'canReopenProject'             => true,
            )
        );
    }

    private function applyClientPermissions($permissions)
    {
        return array_merge(
            $permissions,
            array(
                'canMoveInProgressProjectToDone' => true,
                'canMoveFinishedProjectToDone'   => true,
                'canViewClosedProjects'          => true,
                'canViewTodoProjects'            => true,
                'canUploadNewVideo'              => true,
                'canAssignProject'               => true,
                'canUploadTaskConfiguration'     => true,
                'canDeleteProject'               => true,
                'canCreateNewProject'            => true,
                'canReopenProject'               => true,
                'canCreateProject'               => true,
            )
        );
    }

    private function applyAdminPermissions($permissions)
    {
        return array_merge(
            $permissions,
            array(
                'canViewUserListButton'          => true,
                'canViewStatsButton'             => true,
                'canViewProjectButton'           => true,
                'canViewReopenButton'            => true,
                'unassignPermission'             => true,
                'canExportProject'               => true,
                'canReopenTask'                  => true,
                'canMoveInProgressProjectToDone' => true,
                'canMoveFinishedProjectToDone'   => true,
                'canViewClosedProjects'          => true,
                'canViewTodoProjects'            => true,
                'canAcceptProject'               => true,
                'canViewTaskList'                => true,
                'canEditLabelingGroups'          => true,
                'canViewProjectReport'           => true,
                'canDeleteProject'               => true,
                'canCreateNewProject'            => true,
                'canReopenProject'               => true,
            )
        );
    }

    public function getPermissions()
    {
        $token = $this->tokenStorage->getToken();
        $user  = $token->getUser();

        $permissions = $this->getPermissionDefaults();

        // Non loggedin user has no permissions
        if ($user === null) {
            return $permissions;
        }

        if ($user->hasRole(Model\User::ROLE_LABELER)) {
            $permissions = $this->applyLabelerPermissions($permissions);
        }
        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
            $permissions = $this->applyLabelCoordinatorPermissions($permissions);
        }
        if ($user->hasRole(Model\User::ROLE_CLIENT)) {
            $permissions = $this->applyClientPermissions($permissions);
        }
        if ($user->hasRole(Model\User::ROLE_ADMIN)) {
            $permissions = $this->applyAdminPermissions($permissions);
        }

        return $permissions;
    }

    public function hasPermission($permission)
    {
        $permissions = $this->getPermissions();

        return (array_key_exists($permission, $permissions) && $permissions[$permission] === true);
    }
}
