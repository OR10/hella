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
            ->createQuery('annostation_project_by_name_001', 'view')
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
            ->createQuery('annostation_task_timer_sum_by_projectId_and_taskId_001', 'view')
            ->setGroup(true)
            ->setGroupLevel(1)
            ->setReduce(true)
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
            ->createQuery('annostation_task_timer_sum_by_projectId_and_taskId_001', 'view')
            ->setGroup(true)
            ->setGroupLevel(1)
            ->setStartKey([$project->getId(), null])
            ->setEndKey([$project->getId(), []])
            ->execute()
            ->toArray();

        if (empty($resultSet)) {
            return array();
        }

        return $resultSet[0]['value'];
    }

    /**
     * @param Model\Project $project
     * @return array
     */
    public function getTimeForLabelingTaskInProject(Model\Project $project)
    {
        $timeByTasksAndPhases = $this->documentManager
            ->createQuery('annostation_task_timer_sum_by_projectId_and_taskId_001', 'view')
            ->setGroup(true)
            ->setStartKey([$project->getId(), null])
            ->setEndKey([$project->getId(), []])
            ->execute()
            ->toArray();

        if (empty($timeByTasksAndPhases)) {
            return array();
        }

        $result = array();
        foreach ($timeByTasksAndPhases as $byTask) {
            $taskId          = $byTask['key'][1];
            $result[$taskId] = $byTask['value'];
        }

        return $result;
    }


    
    /**
     * @param string $name
     *
     * @return Model\Project
     */
    public function findByName($name)
    {
        $result = $this->documentManager
            ->createQuery('annostation_project_by_name_001', 'view')
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

    /**
     * @param Model\Project $project
     */
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
     *
     * @return Model\LabelingTask[]
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
            ->createQuery('annostation_project_by_status_001', 'view')
            ->setKey([$status])
            ->onlyDocs(true);

        if ($limit !== null) {
            $query->setLimit((int) $limit)
                ->setSkip((int) $offset);
        }

        return $query->execute();
    }

    /**
     * @param null $status
     * @return View\Result
     */
    public function getSumOfProjectsByStatus($status = null)
    {
        $query = $this->documentManager
            ->createQuery('annostation_project_sum_by_status_and_projectId_001', 'view');

        if ($status !== null) {
            $query->setStartKey([$status, null]);
            $query->setEndKey([$status, []]);
        }
        $query->setReduce(true)
            ->setGroup(true)
            ->setGroupLevel(1)
            ->onlyDocs(false);

        return $query->execute();
    }

    /**
     * @param Model\User $user
     * @param            $status
     * @param bool       $countOnly
     * @return Model\Project[]
     */
    public function findAllByUserAndStatus(
        Model\User $user,
        $status,
        $countOnly = false
    ) {
        if ($user->hasRole(Model\User::ROLE_ADMIN)) {
            if ($countOnly) {
                return $this->getSumOfProjectsByStatus($status);
            } else {
                return $this->findAllByStatus($status);
            }
        }

        if ($user->hasRole(Model\User::ROLE_CLIENT)) {
            $query = $this->documentManager
                ->createQuery('annostation_project_by_userId_and_status_002', 'view');
            $query->setKey([$user->getId(), $status]);
            if ($countOnly) {
                $query->setReduce(true);
                $query->setGroup(true);
            } else {
                $query->onlyDocs(true);
                $query->setReduce(false);
            }

            return $query->execute();
        }

        if ($user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) {
            $query = $this->documentManager
                ->createQuery('annostation_project_by_assigned_userId_and_status_002', 'view');
            $query->setKey([$user->getId(), $status]);
            if ($countOnly) {
                $query->setReduce(true);
                $query->setGroup(true);
            } else {
                $query->onlyDocs(true);
                $query->setReduce(false);
            }

            return $query->execute();
        }

        if ($user->hasRole(Model\User::ROLE_LABELER)) {
            $query = $this->documentManager
                ->createQuery('annostation_labeling_group_by_labeler', 'view');
            $query->setKey($user->getId());

            $labelingGroups = $query->execute()->toArray();

            $keys = array_map(function ($labelingGroup) use ($status) {
                return [$labelingGroup['id'], $status];
            }, $labelingGroups);

            $query = $this->documentManager
                ->createQuery('annostation_project_by_labeling_group_and_status_002', 'view');
            $query->setKeys($keys);
            if ($countOnly) {
                $query->setReduce(true);
                $query->setGroup(true);
            } else {
                $query->onlyDocs(true);
                $query->setReduce(false);
            }

            return $query->execute();
        }
    }
}
