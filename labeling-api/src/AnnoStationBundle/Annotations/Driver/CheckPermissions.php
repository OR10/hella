<?php

namespace AnnoStationBundle\Annotations\Driver;

use AnnoStationBundle\Annotations;
use AnnoStationBundle\Service\Authentication\UserPermissions;
use Symfony\Component\HttpKernel\Event;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CheckPermissions
{
    /**
     * @var \Doctrine\Common\Annotations\Reader
     */
    private $reader;

    /**
     * @var UserPermissions
     */
    private $currentUserPermissions;

    /**
     * @param \Doctrine\Common\Annotations\Reader $reader
     * @param UserPermissions                     $currentUserPermissions
     */
    public function __construct(
        \Doctrine\Common\Annotations\Reader $reader,
        UserPermissions $currentUserPermissions
    ) {
        $this->reader                 = $reader;
        $this->currentUserPermissions = $currentUserPermissions;
    }

    public function onKernelController(Event\FilterControllerEvent $event)
    {
        $request = $event->getRequest();
        $requestController = ($request->attributes->get('_controller'));

        if (!is_array($controllerEvent = $event->getController())) {
            return;
        }

        $controller = new \ReflectionObject($controllerEvent[0]);// get controller
        $method     = $controller->getMethod($controllerEvent[1]);// get method

        foreach ($this->reader->getMethodAnnotations($method) as $annotation) {
            // Start of annotations reading
            if ($annotation instanceof Annotations\CheckPermissions) {
                $allowed = false;
                foreach ($annotation->getPermissions() as $permission) {
                    if ($this->currentUserPermissions->hasPermission($permission)) {
                        $allowed = true;
                    }
                }
                if (!$allowed) {
                    if($requestController == 'annostation.labeling_api.controller.api.organisation.project:assignProjectToUserAction') {
                        throw new AccessDeniedHttpException('You need label manager permissions');
                    } else {
                        throw new AccessDeniedHttpException();
                    }
                }
            }
        }
    }
}
