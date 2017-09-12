<?php

namespace AnnoStationBundle\Controller\Api\v1;

use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Version;
use AnnoStationBundle\Annotations;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service\Authentication;
use AppBundle\Annotations\CloseSession;
use AppBundle\Database\Facade;
use AppBundle\Helper\Monitoring as MonitoringHelper;
use AppBundle\View;
use Symfony\Component\HttpKernel\Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

/**
 * @Version("v1")
 * @Rest\Prefix("/api/{version}/monitoring")
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
     * @Annotations\CheckPermissions({"canViewLatestMonitoringRun"})
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