<?php

namespace AppBundle\Database\Facade;

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
     * @return Model\LabelingGroup
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\Report::class, $id);
    }

    /**
     * @param Model\Project $project
     * @return View\Result
     */
    public function findAllByProject(Model\Project $project)
    {
        $query = $this->documentManager
            ->createQuery('annostation_report_by_project_id', 'by_project')
            ->setKey([$project->getId()])
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