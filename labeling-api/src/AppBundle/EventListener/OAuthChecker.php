<?php

namespace AppBundle\EventListener;

use AnnoStationBundle\Controller\CanViewWithoutOAuth;
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

    /**
     * @param FilterControllerEvent $event
     */
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

        //disable OAuth action for controllers in statement
        if($controller[0] instanceof SecurityController || $controller[0] instanceof CanViewWithoutOAuth || $controller[0] instanceof ProfilerController) return;
        if((!$user && !$pwd) || !$token) {
            throw new UnauthorizedHttpException('Basic Auth header do not exist');
        }
    }

    public function onKernelResponse(FilterResponseEvent $event)
    {

    }

}
