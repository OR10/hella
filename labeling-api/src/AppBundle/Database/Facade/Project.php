<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\ODM\CouchDB;
use JMS\Serializer\Exception\RuntimeException;
use Doctrine\CouchDB\View;

class Project
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
     * @return Model\LabelingTask
     */
    public function find($id)
    {
        return $this->documentManager->find(Model\Project::class, $id);
    }

    /**
     * @param null     $limit
     * @param int|null $offset
     * @return View\Result
     */
    public function findAll($limit = null, $offset = 0)
    {
        $query = $this->documentManager
            ->createQuery('annostation_project', 'by_name')
            ->onlyDocs(true);

        if ($limit !== null) {
            $query->setLimit((int) $limit)
            ->setSkip((int) $offset);
        }

        return $query->execute();
    }

    /**
     * @return array
     */
    public function getTimePerProject()
    {
        $resultSet = $this->documentManager
            ->createQuery('annostation_task_timer', 'sum_by_projectId')
            ->setGroup(true)
            ->execute()
            ->toArray();

        return $resultSet;
    }
    
    /**
     * @param string $name
     *
     * @return Model\Project
     */
    public function findByName($name)
    {
        $result = $this->documentManager
            ->createQuery('annostation_project', 'by_name')
            ->onlyDocs(true)
            ->setKey([$name])
            ->execute()
            ->toArray();

        if (count($result) < 1) {
            return null;
        } else if (count($result) > 1) {
            throw new \RuntimeException('Non unique project name ' . $name . ' found.');
        }
        
        return $result[0];
    }
    
    /**
     * @param Model\Project $project
     *
     * @return Model\Project
     */
    public function save(Model\Project $project)
    {
        $this->documentManager->persist($project);
        $this->documentManager->flush();

        return $project;
    }

    /**
     * Return all task for this project
     *
     * @param Model\Project $project
     * @return mixed
     */
    public function getTasksByProject(Model\Project $project)
    {
        return $this->documentManager
            ->createQuery('annostation_labeling_task', 'by_projectId')
            ->setKey($project->getId())
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }
}
