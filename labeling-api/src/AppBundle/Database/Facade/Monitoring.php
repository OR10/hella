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
     * @var CouchDB\DocumentManager
     */
    private $databaseDocumentManager;

    public function __construct(Service\DatabaseDocumentManagerFactory $databaseDocumentManagerFactory)
    {
        $this->databaseDocumentManager = $databaseDocumentManagerFactory->getDocumentManagerForDatabase(
            'monitoring'
        );
    }

    /**
     * @param Model\MonitoringCheckResults $monitoringCheckResults
     *
     * @return Model\MonitoringCheckResults
     */
    public function save(Model\MonitoringCheckResults $monitoringCheckResults)
    {
        $this->databaseDocumentManager->persist($monitoringCheckResults);
        $this->databaseDocumentManager->flush();

        return $monitoringCheckResults;
    }

    /**
     * @return Model\MonitoringCheckResults|null
     */
    public function getLatestCheckResult()
    {
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