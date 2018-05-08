<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class TaskTimer
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
     * @return object
     */
    public function find(string $id)
    {
        return $this->documentManager->find(Model\TaskTimer::class, $id);
    }

    /**
     * @param Model\TaskTimer $taskExport
     */
    public function delete(Model\TaskTimer $taskExport)
    {
        $this->documentManager->remove($taskExport);
        $this->documentManager->flush();
    }

    /**
     * @param Model\TaskTimer $task
     * @return Model\TaskTimer[]|null
     */
    public function findByTaskId(Model\LabelingTask $task, string $userId)
    {
        return $this->documentManager
            ->createQuery('annostation_task_timer', 'by_taskId_userId')
            ->setKey([$task->getId(), $userId])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }


    /**
     * @param Model\TaskTimer $taskExport
     */
    public function save(Model\TaskTimer $taskExport)
    {
        $this->documentManager->persist($taskExport);
        $this->documentManager->flush();
    }
}
