<?php

namespace AnnoStationBundle\Controller\Api;

use FOS\RestBundle\Controller\Annotations as Rest;
use AnnoStationBundle\Controller;
use AnnoStationBundle\Service\Authentication;
use AppBundle\Annotations\CloseSession;
use AppBundle\Database\Facade;
use AppBundle\Helper\Monitoring as MonitoringHelper;
use AppBundle\View;
use Symfony\Component\HttpKernel\Exception;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

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

    /**
     * @var Authentication\UserPermissions
     */
    private $userPermissions;

    public function __construct(Facade\Monitoring $monitoringFacade, Authentication\UserPermissions $userPermissions)
    {
        $this->monitoringFacade = $monitoringFacade;
        $this->userPermissions  = $userPermissions;
    }

    /**
     * @Rest\Get("")
     *
     * @return View\View
     */
    public function lastMonitoringCheckResultAction()
    {
        if (!$this->userPermissions->hasPermission('canViewLatestMonitoringRun')) {
            throw new Exception\AccessDeniedHttpException();
        }

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