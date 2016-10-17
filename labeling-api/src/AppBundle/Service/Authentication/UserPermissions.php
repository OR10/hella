<?php

namespace AppBundle\Service\Authentication;

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
        'canAcceptProject'               => [                                                 Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canMoveProjectToDone'           => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canViewClosedProjects'          => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canViewTodoProjects'            => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canCreateProject'               => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT                                                              ],
        'canMoveFinishedProjectToDone'   => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canMoveInProgressProjectToDone' => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT                                                              ],
        'canViewStatsButton'             => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canViewProjectButton'           => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canDeleteProject'               => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT                                                              ],
        'canCreateNewProject'            => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canReopenProject'               => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canExportProject'               => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canViewProjectReport'           => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT, Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canAssignProject'               => [                        Model\User::ROLE_CLIENT                                                              ],
        'canViewAttentionTasks'          => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],

        // Label-Jobs
        'canViewTaskList'                => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_LABELER],
        'canViewTaskListOfClosedProject' => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canViewReopenButton'            => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],
        'unassignPermission'             => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canReopenTask'                  => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],
        'canFlagLabelingTask'            => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR, Model\User::ROLE_LABELER],
        'canUnflagLabelingTask'          => [Model\User::ROLE_ADMIN,                          Model\User::ROLE_LABEL_COORDINATOR                          ],

        // User management
        'canEditLabelingGroups'          => [Model\User::ROLE_ADMIN                                                                                       ],
        'canViewUserListButton'          => [Model\User::ROLE_ADMIN                                                                                       ],

        // Management board
        'canUploadNewVideo'              => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT,                                                             ],
        'canUploadTaskConfiguration'     => [Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT,                                                             ],
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
