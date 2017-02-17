<?php
namespace AnnoStationBundle\Database\Facade;

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

    /**
     * @param Model\TaskExport $taskExport
     */
    public function delete(Model\TaskExport $taskExport)
    {
        $this->documentManager->remove($taskExport);
        $this->documentManager->flush();
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return array
     */
    public function findAllByTask(Model\LabelingTask $task)
    {
        return $this->documentManager
            ->createQuery('annostation_task_export', 'by_taskId')
            ->setKey($task->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\TaskExport $taskExport
     */
    public function save(Model\TaskExport $taskExport)
    {
        $this->documentManager->persist($taskExport);
        $this->documentManager->flush();
    }
}
