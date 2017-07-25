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
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var string
     */
    private $replicationUser;

    public function __construct(
        Facade\Project $projectFacade,
        Facade\LabelingTask $labelingTaskFacade,
        Facade\Organisation $organisationFacade,
        Facade\LabelingGroup $labelingGroupFacade,
        AppBundleFacade\User $userFacade,
        AppBundleFacade\CouchDbSecurity $couchDbSecurity,
        $replicationUser
    ) {
        $this->couchDbSecurity       = $couchDbSecurity;
        $this->projectFacade         = $projectFacade;
        $this->organisationFacade    = $organisationFacade;
        $this->userFacade            = $userFacade;
        $this->labelingGroupFacade   = $labelingGroupFacade;
        $this->labelingTaskFacade    = $labelingTaskFacade;
        $this->replicationUser       = $replicationUser;
    }

    /**
     * @param Model\Project $project
     */
    public function updateForProject(Model\Project $project)
    {
        $labelingTasks = $this->labelingTaskFacade->findAllByProject($project, true);

        foreach ($labelingTasks as $labelingTask) {
            $this->updateForTask($labelingTask);
        }
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function updateForTask(Model\LabelingTask $labelingTask)
    {
        $project      = $this->projectFacade->find($labelingTask->getProjectId());
        $organisation = $this->organisationFacade->find($project->getOrganisationId());

        $memberNames = [$this->replicationUser];
        $memberRoles = [
            UserRolesRebuilder::SUPER_ADMIN_GROUP,
            sprintf('%s%s', UserRolesRebuilder::ADMIN_GROUP_PREFIX, $organisation->getId()),
            sprintf('%s%s', UserRolesRebuilder::OBSERVER_GROUP_PREFIX, $organisation->getId()),
        ];

        $memberRoles = array_merge(
            $this->getLabelingGroupRole($project),
            $memberRoles
        );

        $memberRoles = array_merge(
            $this->getCoordinatorRoles($project),
            $memberRoles
        );
        sort($memberRoles);

        $this->couchDbSecurity->updateSecurity(
            sprintf(
                Service\TaskDatabaseCreator::TASK_DATABASE_NAME_TEMPLATE,
                $project->getId(),
                $labelingTask->getId()
            ),
            array_values(array_unique($memberNames)),
            $memberRoles,
            [],
            [],
            $this->getAssignedLabeler($labelingTask)
        );
    }

    private function getCoordinatorRoles(Model\Project $project)
    {
        return [sprintf('%s%s-%s', UserRolesRebuilder::COORDINATORS_PREFIX, $project->getOrganisationId(), $project->getId())];
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return null
     */
    private function getAssignedLabeler(Model\LabelingTask $labelingTask)
    {
        $latestAssignedUserId = $labelingTask->getLatestAssignedUserIdForPhase($labelingTask->getCurrentPhase());
        if ($latestAssignedUserId !== null) {
            return $this->addCouchDbPrefix($this->userFacade->getUserById($latestAssignedUserId)->getUsername());
        }

        return null;
    }

    /**
     * @param Model\Project $project
     *
     * @return array
     */
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
            $memberNames[] = $this->addCouchDbPrefix(
                $this->userFacade->getUserById($latestAssignedCoordinatorUserId)->getUsername()
            );
        }

        return $memberNames;
    }

    /**
     * @param $username
     *
     * @return string
     */
    private function addCouchDbPrefix($username)
    {
        return sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $username);
    }
}
