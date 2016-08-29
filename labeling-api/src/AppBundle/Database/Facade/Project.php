<?php
namespace AppBundle\Database\Facade;

use AppBundle\Model;
use Doctrine\CouchDB\View;
use Doctrine\ODM\CouchDB;

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
     * @return Model\Project
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
            ->createQuery('annostation_task_timer_sum_by_projectId_001', 'view')
            ->setGroup(true)
            ->execute()
            ->toArray();

        return $resultSet;
    }

    /**
     * @param Model\Project $project
     * @return array
     */
    public function getTimeForProject(Model\Project $project)
    {
        $resultSet = $this->documentManager
            ->createQuery('annostation_task_timer_sum_by_projectId_001', 'view')
            ->setGroup(true)
            ->setKey($project->getId())
            ->execute()
            ->toArray();

        return $resultSet[0]['value'];
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
        } elseif (count($result) > 1) {
            throw new \RuntimeException('Non unique project name ' . $name . ' found.');
        }
        
        return $result[0];
    }

    public function reload(Model\Project $project)
    {
        return $this->documentManager->refresh($project);
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

    /**
     * @param          $status
     * @param null     $limit
     * @param int|null $offset
     * @return View\Result
     */
    public function findAllByStatus($status, $limit = null, $offset = 0)
    {
        $query = $this->documentManager
            ->createQuery('annostation_project', 'by_status_' . $status)
            ->onlyDocs(true);

        if ($limit !== null) {
            $query->setLimit((int) $limit)
                ->setSkip((int) $offset);
        }

        return $query->execute();
    }

    /**
     * @return View\Result
     */
    public function getSumOfProjectsByStatus()
    {
        $query = $this->documentManager
            ->createQuery('annostation_project', 'sum_by_status_and_projectId')
            ->setReduce(true)
            ->setGroupLevel(1)
            ->onlyDocs(false);

        return $query->execute();
    }

    /**
     * @param Model\User $user
     * @param            $status
     * @param null       $limit
     * @param int        $offset
     * @param bool       $totalRowsCount
     * @return mixed
     */
    public function getProjectsForUserAndStatus(
        Model\User $user,
        $status = null,
        $limit = null,
        $offset = 0,
        $totalRowsCount = false
    ) {
        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
            $designDocument = 'annostation_project_by_assigned_userId_and_status_001';
        }else {
            $designDocument = 'annostation_project_by_userId_and_status_001';
        }
        $query = $this->documentManager
            ->createQuery($designDocument, 'view');
        if ($status !== null) {
            $query->setKey([$user->getId(), $status]);
        } else {
            $query->setStartKey([$user->getId(), null]);
            $query->setEndKey([$user->getId(), []]);
        }

        if ($totalRowsCount) {
            $query->setReduce(true);
            $query->setGroup(true);
        }else{
            $query->setReduce(false);
            $query->onlyDocs(true);
        }

        if ($limit !== null) {
            $query->setLimit((int)$limit)
                ->setSkip((int)$offset);
        }

        return $query->execute();
    }

    /**
     * @param Model\User $user
     * @param null       $status
     * @return array
     */
    public function getProjectsForUserAndStatusTotalRows(Model\User $user, $status = null)
    {
        $rows = $this->getProjectsForUserAndStatus($user, $status, null, 0, true)->toArray();

        $totalRowsByStatus = [];
        foreach($rows as $row) {
            $totalRowsByStatus[$row['key'][1]] = $row['value'];
        }

        return $totalRowsByStatus;
    }
}
