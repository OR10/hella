<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;

/**
 * @Rest\Prefix("/api/labelingGroup")
 * @Rest\Route(service="annostation.labeling_api.controller.api.labeling_group")
 *
 * @CloseSession
 */
class LabelingGroup extends Controller\Base
{
    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * LabelingGroup constructor.
     * @param Facade\LabelingGroup $labelingGroupFacade
     * @param Facade\User          $userFacade
     */
    public function __construct(
        Facade\LabelingGroup $labelingGroupFacade,
        Facade\User $userFacade
    )
    {
        $this->labelingGroupFacade = $labelingGroupFacade;
        $this->userFacade = $userFacade;
    }

    /**
     *
     * @Rest\Get("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function listAction(HttpFoundation\Request $request)
    {
        $labelingGroups = $this->labelingGroupFacade->findAll();
        $users = $this->getUserListForLabelingGroup($labelingGroups->toArray());

        return View\View::create()->setData(
            [
                'totalRows' => $labelingGroups->getTotalRows(),
                'result' => [
                    'labelingGroups' => $labelingGroups->toArray(),
                    'users' => $users,
                    ]
            ]
        );
    }

    /**
     *
     * @Rest\Post("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return \FOS\RestBundle\View\View
     */
    public function createAction(HttpFoundation\Request $request)
    {
        $coordinators = $request->request->get('coordinators', []);
        $labeler      = $request->request->get('labeler', []);

        $labelingGroup = new Model\LabelingGroup($coordinators, $labeler);
        $users = $this->getUserListForLabelingGroup([$labelingGroup]);
        $this->labelingGroupFacade->save($labelingGroup);

        return View\View::create()->setData(
            [
                'result' => [
                    'labelingGroups' => $labelingGroup,
                    'users' => $users,
                ]
            ]
        );
    }

    /**
     *
     * @Rest\Put("/{labelingGroup}")
     *
     * @param HttpFoundation\Request $request
     *
     * @param Model\LabelingGroup    $labelingGroup
     * @return \FOS\RestBundle\View\View
     */
    public function updateAction(HttpFoundation\Request $request, Model\LabelingGroup $labelingGroup)
    {
        $revision     = $request->request->get('_rev');
        $coordinators = $request->request->get('coordinators', []);
        $labeler      = $request->request->get('labeler', []);

        if ($revision !== $labelingGroup->getRev()) {
            throw new Exception\ConflictHttpException('Revision mismatch');
        }

        $labelingGroup->setCoordinators($coordinators);
        $labelingGroup->setLabeler($labeler);

        $this->labelingGroupFacade->save($labelingGroup);
        $users = $this->getUserListForLabelingGroup([$labelingGroup]);
        return View\View::create()->setData(
            [
                'result' => [
                    'labelingGroups' => $labelingGroup,
                    'users' => $users,
                ]
            ]
        );
    }

    /**
     *
     * @Rest\Delete("/{labelingGroup}")
     *
     * @param HttpFoundation\Request $request
     *
     * @param Model\LabelingGroup    $labelingGroup
     * @return \FOS\RestBundle\View\View
     */
    public function deleteAction(HttpFoundation\Request $request, Model\LabelingGroup $labelingGroup)
    {
        $revision = $request->request->get('_rev');
        if ($revision !== $labelingGroup->getRev()) {
            throw new Exception\ConflictHttpException('Revision mismatch');
        }

        $this->labelingGroupFacade->delete($labelingGroup);

        return View\View::create()->setData(
            [
                'result' => true,
            ]
        );
    }

    /**
     * @param $labelingGroups
     * @return \Traversable
     */
    private function getUserListForLabelingGroup($labelingGroups)
    {
        $labelingUserIds = array_map(function(Model\LabelingGroup $labelingGroup) {
            return array_unique(
                array_merge(
                    $labelingGroup->getCoordinators(),
                    $labelingGroup->getLabeler()
                )
            );
        }, $labelingGroups);
        $users = [];
        foreach($labelingUserIds as $labelingUserId) {
            $users = array_merge($users, $labelingUserId);
        }
        return $this->userFacade->getUserByIds(array_unique($users));
    }
}
