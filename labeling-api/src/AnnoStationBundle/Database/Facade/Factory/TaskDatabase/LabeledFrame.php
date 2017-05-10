<?php

namespace AnnoStationBundle\Database\Facade\Factory\TaskDatabase;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledFrame extends Facade\Factory
{
    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var AppBundleService\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    /**
     * @var string
     */
    private $readOnlyDatabase;

    public function __construct(
        Facade\LabeledFrame $labeledFrameFacade,
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        Service\TaskDatabaseCreator $taskDatabaseCreatorService,
        $readOnlyDatabase
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
        $this->taskDatabaseCreatorService     = $taskDatabaseCreatorService;
        $this->readOnlyDatabase               = $readOnlyDatabase;
        $this->labeledFrameFacade             = $labeledFrameFacade;
    }

    public function getFacadeByProjectIdAndTaskId($projectId, $taskId)
    {
        $databaseName = $this->taskDatabaseCreatorService->getDatabaseName(
            $projectId,
            $taskId
        );
        if (!$this->isInFacadeCache($databaseName)) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $databaseName
            );

            $this->addFacadeCache($databaseName, new Facade\LabeledFrame($databaseDocumentManager));
        }

        return $this->getFacadeCache($databaseName);
    }

    public function getReadOnlyFacade()
    {
        if (!$this->isInFacadeCache($this->readOnlyDatabase)) {
            $databaseDocumentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $this->readOnlyDatabase
            );

            $this->addFacadeCache($this->readOnlyDatabase, new Facade\LabeledFrame($databaseDocumentManager));
        }

        return $this->getFacadeCache($this->readOnlyDatabase);
    }

    public function getFacade()
    {
        $this->labeledFrameFacade;
    }
}