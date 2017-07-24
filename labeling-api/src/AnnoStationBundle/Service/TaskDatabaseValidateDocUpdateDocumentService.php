<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;
use AnnoStationBundle\Service;
use AppBundle\Service as AppBundleService;

class TaskDatabaseValidateDocUpdateDocumentService
{
    /**
     * @var AppBundleService\DatabaseDocumentManagerFactory
     */
    private $databaseDocumentManagerFactory;

    public function __construct(
        AppBundleService\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory
    ) {
        $this->databaseDocumentManagerFactory = $databaseDocumentManagerFactory;
    }

    public function updateForDatabase($database)
    {
        $documentManager = $this->databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            $database
        );

        $documentManager->getCouchDBClient()->createDesignDocument(
            'validation',
            new TaskDatabaseValidateDocUpdateDocumentService\ValidateDocUpdateDocument()
        );
    }
}
