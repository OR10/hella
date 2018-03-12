<?php

namespace AppBundle\EventListener;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;

class OAuthChecker
{

    private $container;

    /**
     * TokenListener constructor.
     * @param $auth
     */
    public function __construct($container)
    {

        $this->container = $container;
    }


    public function onKernelController(FilterControllerEvent $event)
    {
        $controller = $event->getController();
        $req =  $event->getRequest();
        $token = $req->headers->get('Authorization');

        var_dump($controller);

        /*
         * $controller passed can be either a class or a Closure.
         * This is not usual in Symfony but it may happen.
         * If it is a class, it comes in array format
         */
        /*
        if (!is_array($controller)) {
            return;
        }
        if (!($controller[0] instanceof BaseController)) return;
        $this->setInputParam($controller,$req);
        if($controller[0]->input) $this->validate($controller[0]);
        $user = $token ? $this->auth->userByToken($token) : null;
//        if ($controller[0] instanceof UserLevel) {
//            if (!$user) {
//                throw new UnauthorizedApiException;
//            }
//        }
        $controller[0]->currentUser = $user;
        $this->checkAccess($controller);
        */
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {
    }
}
