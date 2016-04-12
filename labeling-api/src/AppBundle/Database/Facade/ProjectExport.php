<?php
namespace AppBundle\Database\Facade;

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

    public function findAllByProject(Model\Project $project)
    {
        return $this->documentManager
            ->createQuery('annostation_project_export', 'by_projectId')
            ->setKey($project->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    public function save(Model\ProjectExport $taskExport)
    {
        $this->documentManager->persist($taskExport);
        $this->documentManager->flush();
    }
}
