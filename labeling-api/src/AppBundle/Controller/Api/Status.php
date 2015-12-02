<?php

namespace AppBundle\Controller\Api;

use AppBundle\Controller;
use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;


/**
 * Controller to query for status information of asynchronous jobs.
 *
 * @Rest\Prefix("/api/status")
 * @Rest\Route(service="annostation.labeling_api.controller.api.status")
 */
class Status extends Controller\Base
{
    /**
     * @var Facade\Status
     */
    private $statusFacade;

    public function __construct(Facade\Status $statusFacade)
    {
        $this->statusFacade = $statusFacade;
    }

    /**
     * TODO: use param-converter (problem: find depends on type)
     *
     * @Rest\Get("/{type}/{statusId}")
     *
     * @param string $type
     * @param string $statusId
     *
     * @return View\View
     */
    public function getStatusAction($type, $statusId)
    {
        $this->closeSession();

        $class = str_replace('.', '\\', $type);

        if (($status = $this->statusFacade->find($class, $statusId)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        return View\View::create()->setData(['result' => $status]);
    }
}
