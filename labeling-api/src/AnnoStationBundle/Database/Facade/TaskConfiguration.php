<?php
namespace AnnoStationBundle\Database\Facade;

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
     * @return Model\TaskConfiguration\SimpleXml|Model\TaskConfiguration\RequirementsXml
     */
    public function find($id)
    {
        try {
            $return = $this->documentManager->find(Model\TaskConfiguration\SimpleXml::class, $id);
        } catch (CouchDB\InvalidDocumentTypeException $exception) {
            $return = $this->documentManager->find(Model\TaskConfiguration\RequirementsXml::class, $id);
        }

        return $return;
    }

    /**
     * Return all task configurations for this user
     *
     * @param Model\User $user
     * @return array
     */
    public function getTaskConfigurationsByUser(Model\User $user)
    {
        return $this->documentManager
            ->createQuery('annostation_task_configuration_by_userId_002', 'view')
            ->setKey([$user->getId()])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * Get the Task Configuration by name and userId
     * @param Model\User $user
     * @param            $name
     * @return array
     */
    public function getTaskConfigurationsByUserAndName(Model\User $user, $name)
    {
        return $this->documentManager
            ->createQuery('annostation_task_configuration_by_userId_and_name_002', 'view')
            ->setKey([$user->getId(), $name])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @param Model\User $user
     * @param            $name
     * @param            $filename
     * @param            $md5Hash
     *
     * @return mixed
     */
    public function getTaskConfigurationByUserAndMd5Hash(Model\User $user, $name, $filename, $md5Hash)
    {
        return $this->documentManager
            ->createQuery('annostation_task_configuration_by_user_filename_and_md5_001', 'view')
            ->setKey([$user->getId(), $name, $filename, $md5Hash])
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }
}
