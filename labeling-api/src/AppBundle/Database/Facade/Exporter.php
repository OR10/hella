<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;
use Doctrine\CouchDB\View;

class Exporter
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
     * @return Model\Export
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\Export::class, $id);
    }

    /**
     * @param Model\Export $export
     * @return Model\Export
     *
     */
    public function save(Model\Export $export)
    {
        $this->documentManager->persist($export);
        $this->documentManager->flush();

        return $export;
    }

    /**
     * @param Model\Project $project
     * @return mixed
     */
    public function findAllByProject(Model\Project $project)
    {
        return $this->documentManager
            ->createQuery('annostation_exporter_by_project_and_date_001', 'view')
            ->setStartKey([$project->getId(), []])
            ->setEndKey([$project->getId(), null])
            ->setDescending(true)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }
}