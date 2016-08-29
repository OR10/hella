<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\View;
use AppBundle\Model;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/projectCount")
 * @Rest\Route(service="annostation.labeling_api.controller.api.project_count")
 *
 * @CloseSession
 */
class ProjectCount extends Controller\Base
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * ProjectCount constructor.
     * @param Facade\Project       $projectFacade
     * @param Storage\TokenStorage $tokenStorage
     */
    public function __construct(Facade\Project $projectFacade, Storage\TokenStorage $tokenStorage)
    {
        $this->projectFacade = $projectFacade;
        $this->tokenStorage  = $tokenStorage;
    }

    /**
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getProjectCountAction(HttpFoundation\Request $request)
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if (($user->hasRole(Model\User::ROLE_CLIENT) || $user->hasRole(Model\User::ROLE_LABEL_COORDINATOR)) &&
            !$user->hasOneRoleOf([Model\User::ROLE_ADMIN, Model\User::ROLE_LABELER])) {
            $sum = $this->projectFacade->getProjectsForUserAndStatusTotalRows($user);
        } else {
            $sum = array();
            foreach ($this->projectFacade->getSumOfProjectsByStatus()->toArray() as $sumByStatus) {
                $sum[$sumByStatus['key'][0]] = $sumByStatus['value'];
            }
        }

        return View\View::create()->setData(
            [
                'result' => $sum,
            ]
        );
    }
}
