<?php

namespace AppBundle\Database\Facade;

use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Service\UuidGenerator;
use Doctrine\ODM\CouchDB\DocumentManager;
use Doctrine\ODM\CouchDB;

class Monitoring
{
    /**
     * @var CouchDB\DocumentManager|null
     */
    private $databaseDocumentManager = null;

    public function __construct(
        Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory,
        $monitoringDatabaseName
    ) {
        if ($monitoringDatabaseName !== null) {
            $this->databaseDocumentManager = $databaseDocumentManagerFactory->getDocumentManagerForDatabase(
                $monitoringDatabaseName
            );
        }
    }

    /**
     * @param Model\MonitoringCheckResults $monitoringCheckResults
     *
     * @return Model\MonitoringCheckResults|null
     */
    public function save(Model\MonitoringCheckResults $monitoringCheckResults)
    {
        if ($this->databaseDocumentManager === null) {
            return null;
        }

        $this->databaseDocumentManager->persist($monitoringCheckResults);
        $this->databaseDocumentManager->flush();

        return $monitoringCheckResults;
    }

    /**
     * @return Model\MonitoringCheckResults|null
     */
    public function getLatestCheckResult()
    {
        if ($this->databaseDocumentManager === null) {
            return null;
        }

        $result = $this->databaseDocumentManager
            ->createQuery('annostation_monitoring_check_results', 'view')
            ->onlyDocs(true)
            ->setLimit(1)
            ->setDescending(true)
            ->execute()
            ->toArray();

        if (empty($result)) {
            return null;
        }

        return reset($result);
    }
}