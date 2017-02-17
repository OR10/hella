<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class ProjectExport
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
     * @return Model\ProjectExport
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\ProjectExport::class, $id);
    }

    /**
     * @param Model\Project $project
     *
     * @return array
     */
    public function findAllByProject(Model\Project $project)
    {
        return $this->documentManager
            ->createQuery('annostation_project_export_004', 'by_projectId_date')
            ->setStartKey([$project->getId(), []])
            ->setEndKey([$project->getId(), null])
            ->setDescending(true)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\ProjectExport $taskExport
     */
    public function save(Model\ProjectExport $taskExport)
    {
        $this->documentManager->persist($taskExport);
        $this->documentManager->flush();
    }

    /**
     * @param Model\ProjectExport $projectExport
     */
    public function delete(Model\ProjectExport $projectExport)
    {
        $this->documentManager->remove($projectExport);
        $this->documentManager->flush();
    }
}
