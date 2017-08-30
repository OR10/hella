<?php

namespace AnnoStationBundle\Service\Authentication;

use AppBundle\Model;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * Service to retrieve permissions for currently loggedin user
 */
class UserPermissions
{
    /**
     * @todo chh: duplicate permission? canCreateProject, canCreateNewProject
     * @todo chh: missing permission? canViewTaskListOfClosedProject
     */
    // @codingStandardsIgnoreStart
    // @formatter:off
    const PERMISSION_MAP = [
        // Label-Project
        'canAcceptProject'                                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canChangeProjectLabelGroupAssignment'            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canAssignAllGroupsToProjects'                    => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canMoveProjectToDone'                            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canViewClosedProjects'                           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER                                       ],
        'canViewTodoProjects'                             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER, Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canViewDeletedProjects'                          => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canCreateProject'                                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canMoveFinishedProjectToDone'                    => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canMoveInProgressProjectToDone'                  => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canViewStats'                                    => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER                                       ],
        'canViewProject'                                  => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER, Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canDeleteProject'                                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canCreateNewProject'                             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canReopenProject'                                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canExportProject'                                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canViewProjectReport'                            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER, Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canAssignProject'                                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canViewProjectQuota'                             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER, Model\User::ROLE_LABELER,                            Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canListAllLabelManagers'                         => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canViewProjectManagementRelatedStatisticsColumn' => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER                                       ],
        'canViewProjectsCreationTimestamp'                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER                                       ],
        'canViewProjectsAssignedLabelManager'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER                                       ],
        'canViewAllProjectsOfAnOrganisation'              => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER, Model\User::ROLE_EXTERNAL_COORDINATOR],

        // Label-Jobs
        'canViewTaskList'                                 => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER, Model\User::ROLE_LABELER, Model\User::ROLE_OBSERVER, Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canViewTaskListOfClosedProject'                  => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER, Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canReopenTask'                                   => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                      Model\User::ROLE_EXTERNAL_COORDINATOR],
        'unassignPermission'                              => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                      Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canFlagLabelingTask'                             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER, Model\User::ROLE_LABELER,                            Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canUnflagLabelingTask'                           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                      Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canViewAttentionTasks'                           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                           Model\User::ROLE_OBSERVER, Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canMoveTaskInOtherPhase'                         => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                      Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canFinishTaskOfOtherUsers'                       => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                      Model\User::ROLE_EXTERNAL_COORDINATOR],
        'canBeginTask'                                    => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER, Model\User::ROLE_LABELER,                            Model\User::ROLE_EXTERNAL_COORDINATOR],

        // User management
        'canEditLabelingGroups'                           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER                                                                                            ],
        'canViewUserList'                                 => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER                                                                                            ],
        'canAddUser'                                      => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER                                                                                            ],
        'canEditUser'                                     => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER                                                                                            ],
        'canDeleteUser'                                   => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER                                                                                            ],

        // Management board
        'canUploadNewVideo'                               => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canUploadTaskConfiguration'                      => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],

        // System Information
        'canViewSystemQueues'                             => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],
        'canViewSystemStatus'                             => [Model\User::ROLE_SUPER_ADMIN                                                                                                                            ],

        //Organisation management
        'canViewOrganisationManagement'                   => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canListOrganisations'                            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canListAllOrganisations'                         => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],
        'canCreateOrganisation'                           => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],
        'canEditOrganisation'                             => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],
        'canDeleteOrganisation'                           => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],
        'canViewOrganisationQuota'                        => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],
        'canAssignUserToAnyOrganisation'                  => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],
        'canAssignUserToOwnOrganisation'                  => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canDeleteUserFromOrganisation'                   => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER,                                                                                           ],
        'canListAllUsers'                                 => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                           ],

        //Monitoring
        'canViewLatestMonitoringRun'                      => [Model\User::ROLE_SUPER_ADMIN                                                                                                                            ],

    ];
    // @formatter:on
    // @codingStandardsIgnoreEnd

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

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
     * @return bool[]
     */
    public function getPermissions()
    {
        /** @var UserInterface $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $permissions = [];

        foreach (self::PERMISSION_MAP as $permission => $roles) {
            $permissions[$permission] = array_reduce(
                $roles,
                function (bool $granted, string $role) use ($user) {
                    return $granted || $user->hasRole($role);
                },
                false
            );
        }

        return $permissions;
    }

    /**
     * @param string $permission
     *
     * @return bool
     */
    public function hasPermission(string $permission)
    {
        $permissions = $this->getPermissions();

        return array_key_exists($permission, $permissions) && $permissions[$permission] === true;
    }
}
