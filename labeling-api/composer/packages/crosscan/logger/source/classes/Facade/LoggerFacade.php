<?php

namespace crosscan\Logger\Facade;

/**
 * Simple facade to encapsulate facility and Payload handling
 * @package crosscan\Logger\Facade
 */
class LoggerFacade
{
    private $logger;
    private $facility;

    /**
     * @param \cscntLogger $logger
     * @param string $logFacility
     */
    public function __construct(\cscntLogger $logger, $logFacility)
    {
        $this->logger   = $logger;
        $this->facility = $logFacility;
    }

    /**
     * @param string $message
     *
     * @param int $severity
     * @param string $id Optionally set the id
     */
    public function logString($message, $severity, $id = null)
    {
        $payload = new \cscntLogStringPayload($severity, $this->facility, $id, $message);
        $this->logger->log($payload);
    }

    /**
     * Logs an exception
     *
     * @param \Exception $exception
     * @param string $id Optionally set the id
     */
    public function logException(\Exception $exception, $severity, $id = null)
    {
        $payload = new \cscntLogExceptionPayload($severity, $this->facility, $id, $exception);
        $this->logger->log($payload);
    }

    /**
     * Replaces the current group by a new group
     */
    public function newGroup()
    {
        $this->logger->newGroup();
    }

    /**
     * @return string returns the current group's identifier
     */
    public function getGroup()
    {
        return $this->logger->getGroup();
    }
}
