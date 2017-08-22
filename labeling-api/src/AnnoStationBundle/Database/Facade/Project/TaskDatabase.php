<?php

namespace AnnoStationBundle\Database\Facade\Project;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AppBundle\Service as AppBundleService;

class TaskDatabase extends Factory\TaskDatabase implements FacadeInterface
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    public function __construct(
        Facade\Project $projectFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase,
        Authentication\UserPermissions $userPermissions
    ) {
        $this->projectFacade                  = $projectFacade;
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->readOnlyDatabase               = $readOnlyDatabase;
        $this->userPermissions                = $userPermissions;
    }

    public function getFacadeInstance($databaseDocumentManager)
    {
        return new Facade\Project($databaseDocumentManager, $this->userPermissions);
    }
}
