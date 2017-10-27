<?php

namespace AnnoStationBundle\Controller\Api\v1\Task;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Database\Facade as AppBundleFacade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use FOS\UserBundle\Util;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/task")
 * @Rest\Route(service="annostation.labeling_api.controller.api.task.replication")
 *
 * @CloseSession
 */
class Replication extends Controller\Base
{
    /**
     * @var Storage\TokenStorageInterface
     */
    private $tokenStorage;

    /**
     * @var AppBundleFacade\User
     */
    private $userFacade;

    /**
     * @var AppBundleFacade\CouchDbUsers
     */
    private $couchDbUsersFacade;

    /**
     * @var Service\UserRolesRebuilder
     */
    private $userRolesRebuilderService;

    /**
     * @var Util\TokenGenerator
     */
    private $tokenGenerator;

    /**
     * @var string
     */
    private $externalCouchDbHost;

    /**
     * @var string
     */
    private $externalCouchDbPort;

    /**
     * @var string
     */
    private $externalCouchDbPath;

    public function __construct(
        Storage\TokenStorageInterface $tokenStorage,
        AppBundleFacade\User $userFacade,
        AppBundleFacade\CouchDbUsers $couchDbUsersFacade,
        Service\UserRolesRebuilder $userRolesRebuilderService,
        Util\TokenGenerator $tokenGenerator,
        $externalCouchDbHost,
        $externalCouchDbPort,
        $externalCouchDbPath
    ) {
        $this->tokenStorage              = $tokenStorage;
        $this->userFacade                = $userFacade;
        $this->couchDbUsersFacade        = $couchDbUsersFacade;
        $this->userRolesRebuilderService = $userRolesRebuilderService;
        $this->tokenGenerator            = $tokenGenerator;
        $this->externalCouchDbHost       = $externalCouchDbHost;
        $this->externalCouchDbPort       = $externalCouchDbPort;
        $this->externalCouchDbPath       = $externalCouchDbPath;
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
        $this->generateNewCouchDbPassword($currentUser);

        $databaseName            = sprintf('taskdb-project-%s-task-%s', $task->getProjectId(), $task->getId());
        $username                = sprintf(
            '%s%s',
            Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX,
            $currentUser->getUsername()
        );
        $externalCouchDbPort     = (int) $this->externalCouchDbPort;
        $externalCouchDbProtocol = 'http';

        if ($externalCouchDbPort === 443) {
            $externalCouchDbProtocol = 'https';
        }

        return View\View::create()->setData(
            [
                'result' => [
                    'taskId'           => $task->getId(),
                    'databaseName'     => $databaseName,
                    'databaseServer'   => sprintf(
                        '%s://%s:%s@%s:%d/%s',
                        $externalCouchDbProtocol,
                        $username,
                        $currentUser->getCouchDbPassword(),
                        $this->externalCouchDbHost,
                        $externalCouchDbPort,
                        $this->externalCouchDbPath
                    ),
                    'databaseUsername' => $username,
                    'databasePassword' => $currentUser->getCouchDbPassword(),
                ],
            ]
        );
    }

    private function generateNewCouchDbPassword(Model\User $user)
    {
        $newCouchDbPassword = substr($this->tokenGenerator->generateToken(), 0, 20);

        $this->couchDbUsersFacade->updateUser(
            sprintf('%s%s', Facade\UserWithCouchDbSync::COUCHDB_USERNAME_PREFIX, $user->getUsername()),
            $newCouchDbPassword
        );

        $user->setCouchDbPassword($newCouchDbPassword);
        $this->userFacade->saveUser($user);

        $this->userRolesRebuilderService->rebuildForUser($user);
    }
}
