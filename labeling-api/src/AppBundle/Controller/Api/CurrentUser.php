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

/**
 * @Rest\Prefix("/api/user")
 * @Rest\Route(service="annostation.labeling_api.controller.api.current_user")
 *
 * @CloseSession
 */
class CurrentUser extends Controller\Base
{
    /**
     * @Rest\Get("/profile")
     */
    public function profileAction()
    {
        return View\View::create()->setData([
            'result' => [
                'username' => 'user',
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
        return new HttpFoundation\Response(
            file_get_contents(__DIR__ . '/../../Resources/dummy-profile-150x150.jpg'),
            HttpFoundation\Response::HTTP_OK,
            [
                'Content-Type' => 'image/jpeg',
            ]
        );
    }
}
