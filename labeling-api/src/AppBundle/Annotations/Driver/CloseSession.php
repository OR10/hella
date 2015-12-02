<?php

namespace AppBundle\Annotations\Driver;

use AppBundle\Annotations;
use Symfony\Component\HttpFoundation\Session;
use Symfony\Component\HttpKernel\Event;

class CloseSession
{
    /**
     * @var \Doctrine\Common\Annotations\Reader
     */
    private $reader;

    /**
     * @var Session\SessionInterface
     */
    private $session;

    /**
     * @param \Doctrine\Common\Annotations\Reader $reader
     * @param Session\SessionInterface            $session
     */
    public function __construct(\Doctrine\Common\Annotations\Reader $reader, Session\SessionInterface $session)
    {
        $this->reader = $reader;
        $this->session = $session;
    }

    /**
     * @param Event\FilterControllerEvent $event
     */
    public function onKernelController(Event\FilterControllerEvent $event)
    {
        if (!is_array($controller = $event->getController())) {
            return;
        }

        $class      = new \ReflectionClass($controller[0]);
        $annotation = $this->reader->getClassAnnotation($class, Annotations\CloseSession::class);

        if ($annotation === null) {
            $method     = $class->getMethod($controller[1]);
            $annotation = $this->reader->getMethodAnnotation($method, Annotations\CloseSession::class);
        }

        if ($annotation !== null) {
            $this->session->save();
        }
    }
}
