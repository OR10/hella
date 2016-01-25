<?php

namespace AppBundle\Annotations\Driver;

use Doctrine\Common\Annotations as CommonAnnotations;
use Symfony\Component\HttpFoundation\Session;
use Symfony\Component\HttpKernel\Event;
use Symfony\Component\Security\Core\Authentication\Token\Storage;
use Symfony\Component\HttpKernel\Exception;
use AppBundle\Annotations;
use AppBundle\Model;
use AppBundle\Service;

class ReadOnlyPrecondition
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
     * @var Storage\TokenStorage
     */
    private $tokenStorage;

    /**
     * @var Service\UserReadOnlyMode
     */
    private $userReadOnlyMode;

    /**
     * @param CommonAnnotations\Reader $reader
     * @param Session\SessionInterface $session
     * @param Storage\TokenStorage $tokenStorage
     * @param Service\UserReadOnlyMode $userReadOnlyMode
     */
    public function __construct(
        CommonAnnotations\Reader $reader,
        Session\SessionInterface $session,
        Storage\TokenStorage $tokenStorage,
        Service\UserReadOnlyMode $userReadOnlyMode
    )
    {
        $this->reader = $reader;
        $this->session = $session;
        $this->tokenStorage = $tokenStorage;
        $this->userReadOnlyMode = $userReadOnlyMode;
    }

    /**
     * @param Event\FilterControllerEvent $event
     */
    public function onKernelController(Event\FilterControllerEvent $event)
    {
        if (!is_array($controller = $event->getController())) {
            return;
        }

        $class = new \ReflectionClass($controller[0]);
        $annotation = $this->reader->getClassAnnotation($class, Annotations\ReadOnlyPrecondition::class);

        if ($annotation === null) {
            $method = $class->getMethod($controller[1]);
            $annotation = $this->reader->getMethodAnnotation($method, Annotations\ReadOnlyPrecondition::class);
        }

        if ($annotation !== null) {
            $attributes = $event->getRequest()->attributes;
            /** @var Model\LabelingTask $labelingTask */
            $labelingTask = $attributes->get($annotation->getTaskPropertyName());
            $user = $this->tokenStorage->getToken()->getUser();
            if (!$labelingTask instanceof Model\LabelingTask || !$user instanceof Model\User) {
                throw new Exception\HttpException(500);
            }

            if ($this->userReadOnlyMode->isTaskReadOnlyForUser($user, $labelingTask)) {
                throw new Exception\PreconditionFailedHttpException();
            }
        }
    }
}
