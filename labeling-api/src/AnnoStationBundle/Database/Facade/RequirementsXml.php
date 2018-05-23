<?php

namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;
use Doctrine\CouchDB\View;

class RequirementsXml
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param string $id
     * @return object
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\TaskConfiguration\RequirementsXml::class, $id);
    }

    /**
     * @param Model\Report $report
     */
    public function delete(Model\Report $report)
    {
        $this->documentManager->remove($report);
        $this->documentManager->flush();
    }
}
