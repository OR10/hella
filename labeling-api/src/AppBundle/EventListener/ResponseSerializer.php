<?php

namespace AppBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseForControllerResultEvent;
use JMS\Serializer\Serializer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Bundle\TwigBundle\TwigEngine;
use FOS\RestBundle\View as RestBundleView;
use AppBundle\View;

class ResponseSerializer
{
    /**
     * @var Serializer
     */
    protected $serializer;

    /**
     * @var RestBundleView\ViewHandlerInterface
     */
    protected $viewHandler;

    /**
     * Constructor.
     *
     * @param RestBundleView\ViewHandlerInterface $viewHandler
     * @param Serializer $serializer
     */
    public function __construct(
        RestBundleView\ViewHandlerInterface $viewHandler,
        Serializer $serializer
    ) {
        $this->viewHandler = $viewHandler;
        $this->serializer = $serializer;
    }

    /**
     * Check if the controller result is an array or a view and convert it to
     * a `RestBundleView\View` which will then be handled by the `$viewHandler`
     * of the fos rest bundle which in turn sets the response on the `$event`.
     *
     * If the controller result could not be converted to
     * a `RestBundleView\View`, no response will be set on the `$event`.
     */
    public function onKernelView(GetResponseForControllerResultEvent $event)
    {
        $format = $event->getRequest()->getRequestFormat();
        $controllerResult = $event->getControllerResult();

        if (is_array($controllerResult)) {
            $controllerResult = RestBundleView\View::create()
                ->setData($controllerResult);
        }

        if ($controllerResult instanceof View\View) {
            $controllerResult = $this->convertView($controllerResult);
        }

        if ($controllerResult instanceof RestBundleView\View) {
            if ($format == 'html') {
                $restBundleView = RestBundleView\View::create()
                    ->setTemplate('AppBundle::debug.html.twig')
                    ->setData(
                        array(
                            'json' => $this->serializer->serialize($controllerResult, 'json'),
                            'xml'  => $this->serializer->serialize($controllerResult, 'xml')
                        )
                    );
                $controllerResult = $restBundleView;
            }

            $event->setResponse($this->viewHandler->handle($controllerResult));
        }
    }

    /**
     * Convert our view to a view used by the fos rest bundle.
     *
     * @param View\View $view our view
     * @return RestBundleView\View
     */
    private function convertView(View\View $view)
    {
        $restBundleView = RestBundleView\View::create()
                ->setData($view->getData())
                ->setStatusCode($view->getStatusCode())
                ->setHeaders($view->getHeaders());

        $templateData = $view->getTemplateData();
        $template = $view->getTemplate();
        $templateVar = $view->getTemplateVar();
        $format = $view->getFormat();
        $location = $view->getLocation();
        $route = $view->getRoute();
        $routeParameters = $view->getRouteParameters();
        $serializationContext = $view->getSerializationContext();

        if ($templateData !== null) {
            $restBundleView->setTemplateData($templateData);
        }
        if ($template !== null) {
            $restBundleView->setTemplate($template);
        }
        if ($templateVar !== null) {
            $restBundleView->setTemplateVar($templateVar);
        }
        if ($format !== null) {
            $restBundleView->setFormat($format);
        }
        if ($location !== null) {
            $restBundleView->setLocation($location);
        }
        if ($route !== null) {
            $restBundleView->setRoute($route);
        }
        if ($routeParameters !== null) {
            $restBundleView->setRouteParameters($routeParameters);
        }
        if ($serializationContext !== null) {
            $restBundleView->setContext($serializationContext);
        }

        return $restBundleView;
    }
}
