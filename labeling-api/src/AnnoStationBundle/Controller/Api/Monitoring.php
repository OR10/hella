<?php

namespace AnnoStationBundle\Controller\Api;

use FOS\RestBundle\Controller\Annotations as Rest;
use AnnoStationBundle\Controller;
use AppBundle\Annotations\CloseSession;
use AppBundle\Database\Facade;
use AppBundle\Helper\Monitoring as MonitoringHelper;
use AppBundle\View;
use Symfony\Component\HttpKernel\Exception;

/**
 * @Rest\Prefix("/api/monitoring")
 * @Rest\Route(service="annostation.labeling_api.controller.api.monitoring")
 *
 * @CloseSession
 */
class Monitoring extends Controller\Base
{
    /**
     * @var Facade\Monitoring
     */
    private $monitoringFacade;

    public function __construct(Facade\Monitoring $monitoringFacade)
    {
        $this->monitoringFacade = $monitoringFacade;
    }

    /**
     * @Rest\Get("")
     *
     * @return View\View
     */
    public function lastMonitoringCheckResultAction()
    {
        $result = $this->monitoringFacade->getLatestCheckResult();

        if ($result === null) {
            return View\View::create()->setData(['result' => []]);
        }

        $statusCode = 200;
        if ($result->getGlobalCheckStatus() === MonitoringHelper\CouchDbReporter::STATUS_CRITICAL ||
            $result->getGlobalCheckStatus() === MonitoringHelper\CouchDbReporter::STATUS_WARNING) {
            $statusCode = 502;
        }

        return View\View::create()->setData(['result' => $result])->setStatusCode($statusCode);
    }
}