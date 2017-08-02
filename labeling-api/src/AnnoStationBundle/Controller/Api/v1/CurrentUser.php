<?php

namespace AnnoStationBundle\Controller\Api\v1;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AppBundle\Database\Facade;
use AnnoStationBundle\Database\Facade as AnnoStationBundleFacade;
use AppBundle\Model;
use AnnoStationBundle\Service;
use AnnoStationBundle\Service\Authentication;
use AppBundle\View;
use AppBundle\Service\Validation;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Symfony\Component\Security\Core\Encoder;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/currentUser")
 * @Rest\Route(service="annostation.labeling_api.controller.api.current_user")
 *
 * @CloseSession
 */
class CurrentUser extends Controller\Base
{
    /**
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @var Encoder\EncoderFactory
     */
    private $encoderFactory;

    /**
     * @var Authentication\UserPermissions
     */
    private $currentUserPermissions;

    /**
     * @var AnnoStationBundleFacade\Organisation
     */
    private $organisation;
    /**
     * @var Validation\ValidationService
     */
    private $validationService;

    /**
     * CurrentUser constructor.
     *
     * @param Storage\TokenStorage                 $tokenStorage
     * @param Encoder\EncoderFactory               $encoderFactory
     * @param Facade\User                          $userFacade
     * @param AnnoStationBundleFacade\Organisation $organisation
     * @param Authentication\UserPermissions       $currentUserPermissions
     * @param Validation\ValidationService         $validationService
     */
    public function __construct(
        Storage\TokenStorage $tokenStorage,
        Encoder\EncoderFactory $encoderFactory,
        Facade\User $userFacade,
        AnnoStationBundleFacade\Organisation $organisation,
        Authentication\UserPermissions $currentUserPermissions,
        Validation\ValidationService $validationService
    ) {
        $this->tokenStorage           = $tokenStorage;
        $this->userFacade             = $userFacade;
        $this->encoderFactory         = $encoderFactory;
        $this->currentUserPermissions = $currentUserPermissions;
        $this->organisation           = $organisation;
        $this->validationService      = $validationService;
    }

    /**
     * @Rest\Get("/profile")
     *
     * @return View\View
     */
    public function profileAction(HttpFoundation\Request $request)
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        return View\View::create()->setData(
            [
                'result' => [
                    'id'        => $user->getId(),
                    'username'  => $user->getUsername(),
                    'email'     => $user->getEmail(),
                    'roles'     => $user->getRoles(),
                    'expiresAt' => $user->getExpiresAt(),
                ],
            ]
        );
    }

    /**
     * @Rest\Get("/profile/picture")
     *
     * @return HttpFoundation\Response
     */
    public function profilePictureAction()
    {
        $user = $this->tokenStorage->getToken()->getUser();

        $userProfileImage = $this->userFacade->getUserProfileImage($user);
        if ($userProfileImage === null) {
            $userProfileImage = file_get_contents(__DIR__ . '/../../Resources/dummy-profile-150x150.jpg');
        }

        return new HttpFoundation\Response(
            $userProfileImage,
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type' => 'image/jpeg',
            ]
        );
    }

    /**
     * Edit a User
     *
     * @Rest\Put("/password")
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function editUserPasswordAction(HttpFoundation\Request $request)
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $oldPassword = $request->request->get('oldPassword');
        $newPassword = $request->request->get('newPassword');

        $encoder = $this->encoderFactory->getEncoder($user);

        if (!$encoder->isPasswordValid($user->getPassword(), $oldPassword, $user->getSalt())) {
            return View\View::create()->setData(
                [
                    'result' =>
                        [
                            'error' => [
                                [
                                    'field'   => 'password',
                                    'message' => 'Failed to save the new password. The current password is not correct',
                                ],
                            ],
                        ],
                ]
            );
        }

        $user->setPlainPassword($newPassword);
        $validationResult = $this->validationService->validate($user);
        if ($validationResult->hasErrors()) {
            return View\View::create()->setData(
                [
                    'result' =>
                        [
                            'error' => $validationResult->getErrors(),
                        ],
                ]
            );
        }

        $this->userFacade->updateUser($user);

        return View\View::create()->setData(['result' => ['success' => true]]);
    }

    /**
     * @Rest\Get("/permissions")
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getUserPermissionsAction()
    {
        return View\View::create()->setData(
            [
                'result' => $this->currentUserPermissions->getPermissions(),
            ]
        );
    }

    /**
     * @Rest\Get("/organisations")
     *
     * @return View\View
     */
    public function getUserOrganisationsAction()
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        if ($this->currentUserPermissions->hasPermission('canListAllOrganisations')) {
            $organisations = $this->organisation->findAll();
        } else {
            $organisations = $this->organisation->findByIds($user->getOrganisations());
        }

        return View\View::create()->setData(
            [
                'result' => $organisations,
            ]
        );
    }
}
