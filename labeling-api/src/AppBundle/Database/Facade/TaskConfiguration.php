<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;

class TaskConfiguration
{
    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    /**
     * TaskConfiguration constructor.
     * @param CouchDB\DocumentManager $documentManager
     */
    public function __construct(CouchDB\DocumentManager $documentManager)
    {
        $this->documentManager = $documentManager;
    }

    /**
     * @param Model\TaskConfiguration $taskConfiguration
     * @return Model\TaskConfiguration
     */
    public function save(Model\TaskConfiguration $taskConfiguration)
    {
        $this->documentManager->persist($taskConfiguration);
        $this->documentManager->flush();

        return $taskConfiguration;
    }

    /**
     * @param $id
     * @return Model\TaskConfiguration
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\TaskConfiguration::class, $id);
    }
}
