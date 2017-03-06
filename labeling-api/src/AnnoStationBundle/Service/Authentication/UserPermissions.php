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
        'canAcceptProject'                => [Model\User::ROLE_SUPER_ADMIN,                                                  Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canMoveProjectToDone'            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canViewClosedProjects'           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          , Model\User::ROLE_OBSERVER                               ],
        'canViewTodoProjects'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          , Model\User::ROLE_OBSERVER                               ],
        'canViewDeletedProjects'          => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN                                                                                                                                                 ],
        'canCreateProject'                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT                                                                                                                        ],
        'canMoveFinishedProjectToDone'    => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canMoveInProgressProjectToDone'  => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT                                                                                                                        ],
        'canViewStatsButton'              => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          , Model\User::ROLE_OBSERVER                               ],
        'canViewProjectButton'            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          , Model\User::ROLE_OBSERVER                               ],
        'canDeleteProject'                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT                                                                                                                        ],
        'canCreateNewProject'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canReopenProject'                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canExportProject'                => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canViewProjectReport'            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          , Model\User::ROLE_OBSERVER                               ],
        'canAssignProject'                => [Model\User::ROLE_SUPER_ADMIN,                         Model\User::ROLE_CLIENT                                                                                                                        ],
        'canViewAttentionTasks'           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          , Model\User::ROLE_OBSERVER                               ],
        'canViewProjectQuota'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                                                                                                                                                ],

        // Label-Jobs
        'canViewTaskList'                 => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_LABELER, Model\User::ROLE_OBSERVER                               ],
        'canViewTaskListOfClosedProject'  => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          , Model\User::ROLE_OBSERVER                               ],
        'canViewReopenButton'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'unassignPermission'              => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canReopenTask'                   => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canFlagLabelingTask'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_LABELER                                                          ],
        'canUnflagLabelingTask'           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canMoveTaskInOtherPhase'         => [Model\User::ROLE_SUPER_ADMIN,                                                  Model\User::ROLE_LABEL_COORDINATOR                                                                                    ],
        'canBeginTask'                    => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_LABELER                                                          ],

        // User management
        'canEditLabelingGroups'           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN                                                                                                                                                 ],
        'canViewUserListButton'           => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN                                                                                                                                                 ],
        'canDeleteUser'                   => [Model\User::ROLE_SUPER_ADMIN,                                                                                                                                                                        ],

        // Management board
        'canUploadNewVideo'               => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT,                                                                                                                       ],
        'canUploadTaskConfiguration'      => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT,                                                                                                                       ],

        // System Information
        'canViewSystemQueues'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN                                                                                                                                                 ],
        'canViewSystemStatus'             => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN                                                                                                                                                 ],

        //Organisation management
        'canViewOrganisationManagement'   => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                                                                                                                                                ],
        'canListOrganisations'            => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                                                                                                                                                ],
        'canListAllOrganisations'         => [Model\User::ROLE_SUPER_ADMIN                                                                                                                                                                         ],
        'canCreateOrganisation'           => [Model\User::ROLE_SUPER_ADMIN                                                                                                                                                                         ],
        'canEditOrganisation'             => [Model\User::ROLE_SUPER_ADMIN                                                                                                                                                                         ],
        'canDeleteOrganisation'           => [Model\User::ROLE_SUPER_ADMIN                                                                                                                                                                         ],
        'canViewOrganisationQuota'        => [Model\User::ROLE_SUPER_ADMIN                                                                                                                                                                         ],
        'canAddUserToOrganisation'        => [Model\User::ROLE_SUPER_ADMIN                                                                                                                                                                         ],
        'canDeleteUserFromOrganisation'   => [Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_ADMIN,                                                                                                                                                ],
        'canListAllUsers'                 => [Model\User::ROLE_SUPER_ADMIN                                                                                                                                                                         ],

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
