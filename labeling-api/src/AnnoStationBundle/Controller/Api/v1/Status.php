<?php

namespace AnnoStationBundle\Controller\Api\v1;

use AppBundle\Annotations\CloseSession;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\View;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel\Exception;

/**
 * Controller to query for status information of asynchronous jobs.
 *
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/status")
 * @Rest\Route(service="annostation.labeling_api.controller.api.status")
 *
 * @CloseSession
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
     * @return \FOS\RestBundle\View\View
     */
    public function getStatusAction($type, $statusId)
    {
        $class = str_replace('.', '\\', $type);

        if (($status = $this->statusFacade->find($class, $statusId)) === null) {
            throw new Exception\NotFoundHttpException('No status found');
        }

        return View\View::create()->setData(['result' => $status]);
    }
}
