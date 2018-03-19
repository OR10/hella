<?php

namespace AppBundle\EventListener;

use AnnoStationBundle\Controller\Api\v1\CurrentUser;
use AnnoStationBundle\Controller\CanViewWithoutOAuth;
use AppBundle\Exception;
use FOS\UserBundle\Controller\SecurityController;
use Symfony\Bundle\WebProfilerBundle\Controller\ProfilerController;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

/**
 * Class OAuthChecker
 * @package AppBundle\EventListener
 */
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

    /**
     * @param FilterControllerEvent $event
     */
    public function onKernelController(FilterControllerEvent $event)
    {
//        TODO: remove this file!!!!1111
        $token = null;
        $controller = $event->getController();
        $req =  $event->getRequest();
        $apiKey = $req->headers->get('Auth');

        $token =  ($apiKey && preg_match('/Bearer\s(\S+)/', $apiKey, $matches)) ? $matches : null;


        //disable OAuth action for controllers in statement
//        if ($controller[0] instanceof SecurityController || $controller[0] instanceof CanViewWithoutOAuth || $controller[0] instanceof ProfilerController || $controller[0] instanceof CurrentUser) {
        if ($controller[0] instanceof SecurityController || $controller[0] instanceof CanViewWithoutOAuth || $controller[0] instanceof ProfilerController) {
            return;
        } else {
            $tokenStorage = $this->container->get('security.token_storage');
            $currentToken = $tokenStorage->getToken()->getUser()->getToken();
            if(!$token || ($token != $currentToken) ) {
//                throw new Exception('Authorization token not valid');
                throw new UnauthorizedHttpException('Authorization token not valid');
            }
        }
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {

    }

}
