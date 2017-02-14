<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class Exporter
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param string $id
     *
     * @return Model\Export
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\Export::class, $id);
    }

    /**
     * @param Model\Export $export
     *
     * @return Model\Export
     */
    public function save(Model\Export $export)
    {
        $this->documentManager->persist($export);
        $this->documentManager->flush();

        return $export;
    }

    /**
     * @param Model\Export $export
     */
    public function delete(Model\Export $export)
    {
        $this->documentManager->remove($export);
        $this->documentManager->flush();
    }

    /**
     * @param Model\Project $project
     *
     * @return Model\Export[]
     */
    public function findAllByProject(Model\Project $project)
    {
        return $this->documentManager
            ->createQuery('annostation_exporter_by_project_and_date_001', 'view')
            ->onlyDocs(true)
            ->setStartKey([$project->getId(), []])
            ->setEndKey([$project->getId(), null])
            ->setDescending(true)
            ->execute()
            ->toArray();
    }
}
