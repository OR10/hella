<?php

namespace AppBundle\EventListener;

use AppBundle\Model;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;

/**
 * Adds context of the current request to tideways
 */
class TidewaysContextGenerator
{
    /**
     * @var TokenStorage
     */
    private $tokenStorage;

    /**
     * TidewaysContextGenerator constructor.
     */
    public function __construct(TokenStorage $tokenStorage)
    {
        $this->tokenStorage = $tokenStorage;
    }

    public function onKernelController(FilterControllerEvent $event)
    {
        if (class_exists('\Tideways\Profiler')) {
            $this->appendContextToTideways($event);
        }
    }

    private function appendContextToTideways(FilterControllerEvent $event)
    {
        $this->appendUserContextToTideways($event);
    }

    private function appendUserContextToTideways(FilterControllerEvent $event)
    {
        $token = $this->tokenStorage->getToken();

        if ($token === null) {
            return;
        }

        if (!$token->isAuthenticated()) {
            return;
        }

        $user = $this->getUser();
        if ($user instanceof Model\User) {
            \Tideways\Profiler::setCustomVariable('user', $user->getUsername());
        }
    }

    /**
     * @return Model\User
     */
    private function getUser()
    {
        return $this->tokenStorage->getToken()->getUser();
    }
}
