<?php

namespace AppBundle\EventListener;

use AppBundle\Exception;
use FOS\UserBundle\Controller\SecurityController;
use GuzzleHttp\Exception\BadResponseException;
use Prophecy\Exception\Call\UnexpectedCallException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class OAuthChecker
{

    public function onKernelController(FilterControllerEvent $event)
    {
        $token = null;
        $controller = $event->getController();
        $req =  $event->getRequest();
        $user = $req->headers->get('php-auth-user');
        $pwd = $req->headers->get('php-auth-pw');
        $apiKey = $req->headers->get('Authorization');
        if($apiKey) {
            if (preg_match('/Basic\s(\S+)/', $apiKey, $matches)) {
                $token = $matches[1];
            }
        }

        if($controller[0] instanceof SecurityController) return;

        if((!$user && !$pwd) || !$token) {
            throw new UnauthorizedHttpException('Basic Auth header do not exist');
        }
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {

    }

}
