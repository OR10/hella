<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use AppBundle\Controller;
use AppBundle\View;
use crosscan\Logger;
use FOS\RestBundle\Controller\Annotations as Rest;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpKernel;

/**
 * This controller provides routes for log messages of the ui.
 *
 * @Rest\Prefix("/api/uiLog")
 * @Rest\Route(service="annostation.labeling_api.controller.api.ui_log")
 *
 * @CloseSession
 */
class UiLog extends Controller\Base
{
    /**
     * @var \cscntLogger
     */
    private $loggerFacade;

    /**
     * UiLog constructor.
     *
     * @param \cscntLogger $logger
     */
    public function __construct(\cscntLogger $logger)
    {
        $this->loggerFacade = new Logger\Facade\LoggerFacade($logger, self::class);
    }

    /**
     * @Rest\Post("")
     *
     * @param HttpFoundation\Request $request
     *
     * @return View\View
     */
    public function logAction(HttpFoundation\Request $request)
    {
        $logMessages = $request->request->get('log');

        if (!is_array($logMessages)) {
            throw new HttpKernel\Exception\BadRequestHttpException('No logs provided');
        }

        foreach ($logMessages as $logMessage) {
            $this->loggerFacade->logString(json_encode($logMessage), $this->convertSeverity($logMessage['level']));
        }

        return new View\View();
    }

    /**
     * Converts the log level used by the ui to a severity used by the logger.
     *
     * @param string $logLevel
     *
     * @return int
     */
    private function convertSeverity(string $logLevel)
    {
        switch ($logLevel) {
            case 'info':
                return \cscntLogPayload::SEVERITY_INFO;
            case 'warning':
                return \cscntLogPayload::SEVERITY_WARNING;
            case 'error':
                return \cscntLogPayload::SEVERITY_ERROR;
        }

        return \cscntLogPayload::SEVERITY_DEBUG;
    }
}