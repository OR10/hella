<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class TaskExport
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
     * @return Model\TaskExport
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\TaskExport::class, $id);
    }

    public function findAll()
    {
        return $this->documentManager
            ->createQuery('labeling_api', 'task_exports')
            ->onlyDocs(true)
            ->execute();
    }

    public function save(Model\TaskExport $taskExport)
    {
        $this->documentManager->persist($taskExport);
        $this->documentManager->flush();
    }
}
