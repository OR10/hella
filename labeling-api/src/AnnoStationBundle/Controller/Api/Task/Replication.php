<?php

namespace AnnoStationBundle\Controller\Api\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Annotations\ForbidReadonlyTasks;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Rest\Prefix("/api/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.replication")
 *
 * @CloseSession
 */
class Replication extends Controller\Base
{
    /**
     * @var string
     */
    private $externalCouchDbHost;

    /**
     * @var string
     */
    private $externalCouchDbPort;

    /**
     * @var Storage\TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * @var string
     */
    private $externalCouchDbPath;

    public function __construct(Storage\TokenStorageInterface $tokenStorage, $externalCouchDbHost, $externalCouchDbPort, $externalCouchDbPath)
    {
        $this->externalCouchDbHost = $externalCouchDbHost;
        $this->externalCouchDbPort = $externalCouchDbPort;
        $this->tokenStorage        = $tokenStorage;
        $this->externalCouchDbPath = $externalCouchDbPath;
    }

    /**
     * @Rest\Get("/{task}/replication")
     *
     * @param HttpFoundation\Request $request
     * @param Model\LabelingTask     $task
     *
     * @return View\View
     */
    public function getReplicationDatabaseAction(HttpFoundation\Request $request, Model\LabelingTask $task)
    {
        /** @var Model\User $currentUser */
        $currentUser = $this->tokenStorage->getToken()->getUser();
        $databaseName = sprintf('taskdb-project-%s-task-%s', $task->getProjectId(), $task->getId());
        $username = sprintf(
            '%s%s',
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX,
            $currentUser->getUsername()
        );

        return View\View::create()->setData(
            [
                'result' => [
                    'taskId'         => $task->getId(),
                    'databaseName'   => $databaseName,
                    'databaseServer' => sprintf(
                        'http://%s:%s@%s:%s/%s',
                        $username,
                        $currentUser->getCouchDbPassword(),
                        $this->externalCouchDbHost,
                        $this->externalCouchDbPort,
                        $this->externalCouchDbPath
                    ),
                    'databaseUsername' => $username,
                    'databasePassword' => $currentUser->getCouchDbPassword(),
                ],
            ]
        );
    }
}