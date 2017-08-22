<?php
namespace AnnoStationBundle\Database\Facade;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
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
     * @param Model\Project $project
     */
    public function refresh(Model\Project $project)
    {
        $this->documentManager->refresh($project);
    }

    public function update()
    {
        $this->documentManager->flush();
    }

    /**
     * @param Model\Project $project
     */
    public function delete(Model\Project $project)
    {
        $this->documentManager->remove($project);
        $this->documentManager->flush();
    }

    /**
     * @param null     $limit
     * @param int|null $offset
     * @return View\Result
     */
    public function findAll($limit = null, $offset = 0)
    {
        $query = $this->documentManager
            ->createQuery('annostation_project_by_name_002', 'view')
            ->onlyDocs(true);

        if ($limit !== null) {
            $query->setLimit((int) $limit)
            ->setSkip((int) $offset);
        }

        return $query->execute();
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return View\Result
     */
    public function findAllByOrganisation(AnnoStationBundleModel\Organisation $organisation)
    {
        $query = $this->documentManager
            ->createQuery('annostation_project_by_organisation_and_status_002', 'view')
            ->setStartKey([$organisation->getId(), null])
            ->setEndKey([$organisation->getId(), []])
            ->setReduce(false)
            ->onlyDocs(true);

        return $query->execute();
    }

    /**
     * @param null     $limit
     * @param int|null $offset
     * @return View\Result
     */
    public function findAllDeleted($limit = null, $offset = 0)
    {
        $query = $this->documentManager
            ->createQuery('annostation_deleted_projects', 'view')
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
            ->createQuery('annostation_project_by_name_002', 'view')
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
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param                                     $status
     * @param null                                $limit
     * @param int|null                            $offset
     *
     * @return View\Result
     */
    public function findAllByStatus(
        AnnoStationBundleModel\Organisation $organisation,
        $status,
        $limit = null,
        $offset = 0
    ) {
        $query = $this->documentManager
            ->createQuery('annostation_project_by_organisation_and_status_002', 'view')
            ->setKey([$organisation->getId(), $status])
            ->onlyDocs(true);

        if ($limit !== null) {
            $query->setLimit((int) $limit)
                ->setSkip((int) $offset);
        }

        return $query->execute();
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param null                                $status
     *
     * @return View\Result
     */
    public function getSumOfProjectsByStatus(AnnoStationBundleModel\Organisation $organisation, $status)
    {
        $query = $this->documentManager
            ->createQuery('annostation_project_sum_by_organisation_status_and_projectId_002', 'view')
            ->setStartKey([$organisation->getId(), $status, null])
            ->setEndKey([$organisation->getId(), $status, []])
            ->setReduce(true)
            ->setGroup(true)
            ->setGroupLevel(1)
            ->onlyDocs(false);

        return $query->execute();
    }

    /**
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\User                          $user
     * @param                                     $status
     * @param bool                                $countOnly
     *
     * @return View\Result
     */
    public function findAllByUserAndStatus(
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $user,
        $status,
        $countOnly = false
    ) {
        if ($user->hasOneRoleOf([Model\User::ROLE_SUPER_ADMIN, Model\User::ROLE_LABEL_MANAGER, Model\User::ROLE_OBSERVER])) {
            if ($countOnly) {
                return $this->getSumOfProjectsByStatus($organisation, $status);
            } else {
                return $this->findAllByStatus($organisation, $status);
            }
        }

        if ($user->hasRole(Model\User::ROLE_LABELER)) {
            $query = $this->documentManager
                ->createQuery('annostation_labeling_group_by_labeler', 'view');
            $query->setKey([$organisation->getId(), $user->getId()]);

            $labelingGroups = $query->execute()->toArray();

            $keys = array_map(function ($labelingGroup) use ($status) {
                return [$labelingGroup['id'], $status];
            }, $labelingGroups);

            $query = $this->documentManager
                ->createQuery('annostation_project_by_labeling_group_and_status_003', 'view');
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

    /**
     * @param Model\LabelingGroup $labelingGroup
     *
     * @return Model\Project[]
     */
    public function getProjectsForLabelGroup(Model\LabelingGroup $labelingGroup)
    {
        return $this->documentManager
            ->createQuery('annostation_project_by_labeling_group_and_status_003', 'view')
            ->setStartKey([$labelingGroup->getId(), null])
            ->setEndKey([$labelingGroup->getId(), []])
            ->setReduce(false)
            ->onlyDocs(true)
            ->execute()
            ->toArray();
    }

    /**
     * @return array
     */
    public function getNumberOfProjectsByOrganisations()
    {
        $query = $this->documentManager
            ->createQuery('annostation_number_of_projects_by_organisation', 'view')
            ->onlyDocs(false)
            ->setReduce(true)
            ->setGroupLevel(1)
            ->execute()
            ->toArray();

        $numberOfProjectsByOrganisation = [];
        foreach ($query as $value) {
            $numberOfProjectsByOrganisation[$value['key'][0]] = $value['value'];
        }

        return $numberOfProjectsByOrganisation;
    }
}
