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
use Symfony\Component\Security\Core\Encoder;

/**
 * @Rest\Prefix("/api/user")
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
     * CurrentUser constructor.
     * @param Storage\TokenStorage $tokenStorage
     * @param Encoder\EncoderFactory $encoderFactory
     * @param Facade\User $userFacade
     */
    public function __construct(Storage\TokenStorage $tokenStorage, Encoder\EncoderFactory $encoderFactory, Facade\User $userFacade)
    {
        $this->tokenStorage = $tokenStorage;
        $this->userFacade   = $userFacade;
        $this->encoderFactory = $encoderFactory;
    }

    /**
     * @Rest\Get("/profile")
     */
    public function profileAction()
    {
        $user = $this->tokenStorage->getToken()->getUser();
        return View\View::create()->setData([
            'result' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
            ],
        ]);
    }

    /**
     * @Rest\Get("/profile/picture")
     *
     * @return \FOS\RestBundle\View\View
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
     * @return \FOS\RestBundle\View\View
     */
    public function editUserPasswordAction(HttpFoundation\Request $request)
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $oldPassword = $request->request->get('oldPassword');
        $newPassword = $request->request->get('newPassword');

        $encoder = $this->encoderFactory->getEncoder($user);

        if ($encoder->isPasswordValid($user->getPassword(), $oldPassword, $user->getSalt())) {
            $user->setPlainPassword($newPassword);
            $this->userFacade->updateUser($user);

            return View\View::create()->setData(['result' => ['success' => true]]);
        }

        throw new Exception\BadRequestHttpException();
    }

    /**
     * @Rest\Get("/permissions")
     *
     * @return \FOS\RestBundle\View\View
     */
    public function getUserPermissionsAction()
    {
        /** @var Model\User $user */
        $user = $this->tokenStorage->getToken()->getUser();

        $statsButton = false;
        $userListButton = false;
        $videoUploadButton = false;

        if ($user->hasRole('ROLE_ADMIN')) {
            $statsButton = true;
            $userListButton = true;
            $videoUploadButton = true;
        }
        if ($user->hasRole('ROLE_LABEL_COORDINATOR')) {
            $statsButton = true;
            $videoUploadButton = true;
        }

        return View\View::create()->setData(
            [
                'canViewStatsButton' => $statsButton,
                'canViewUserListButton' => $userListButton,
                'canViewVideoUploadButton' => $videoUploadButton,
            ]
        );
    }
}
