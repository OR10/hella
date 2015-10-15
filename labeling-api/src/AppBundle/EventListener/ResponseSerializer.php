<?php

namespace AppBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseForControllerResultEvent;
use JMS\Serializer\Serializer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\TwigBundle\TwigEngine;

class ResponseSerializer
{
    /**
     * @var Serializer
     */
    protected $serializer;

    /**
     * @var TwigEngine
     */
    protected $twig;

    /**
     * Constructor.
     *
     * @param ContainerInterface $container The service container instance
     */
    public function __construct(Serializer $serializer, TwigEngine $twig)
    {
        $this->serializer = $serializer;
        $this->twig = $twig;
    }

    public function onKernelView(GetResponseForControllerResultEvent $event)
    {
        $format = $event->getRequest()->getRequestFormat();
        $controllerResult = $event->getControllerResult();

        $serializedResult = $this->serializer->serialize($controllerResult, $format);

        $response = new Response(
            $serializedResult
        );

        $event->setResponse($response);
    }
}
