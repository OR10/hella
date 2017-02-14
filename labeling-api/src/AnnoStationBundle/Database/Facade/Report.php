<?php

namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;
use Doctrine\CouchDB\View;

class Report
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
     * @param $id
     * @return Model\Report
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\Report::class, $id);
    }

    /**
     * @param Model\Report $report
     */
    public function delete(Model\Report $report)
    {
        $this->documentManager->remove($report);
        $this->documentManager->flush();
    }

    /**
     * @param Model\Project $project
     * @return View\Result
     */
    public function findAllByProject(Model\Project $project)
    {
        $query = $this->documentManager
            ->createQuery('annostation_report_by_project_id_and_date_001', 'view')
            ->setStartKey([$project->getId(), []])
            ->setEndKey([$project->getId(), null])
            ->setDescending(true)
            ->onlyDocs(true);

        return $query->execute();
    }

    /**
     * @param Model\Report $report
     * @return Model\Report
     */
    public function save(Model\Report $report)
    {
        $this->documentManager->persist($report);
        $this->documentManager->flush();

        return $report;
    }
}
