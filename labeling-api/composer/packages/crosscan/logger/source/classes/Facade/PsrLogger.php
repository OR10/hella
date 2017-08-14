<?php

namespace crosscan\Logger\Facade;

use crosscan\Logger\Payload;
use Psr\Log;

class PsrLogger extends Log\AbstractLogger
{
    /**
     * cscntLogger Instance used in this class to log the messages to
     *
     * @var \cscntLogger
     */
    protected $loggerInstance;

    /**
     * Facility to be logged to should be one found in \cscntLogFacility::<name>
     *
     * @var string|null
     */
    protected $logFacility;

    /**
     * Constructs a new LoggerFacade with the needed cscntLogger instance.
     *
     * @param \cscntLogger $loggerInstance
     * @param string|null  $logFacility to be logged to should be one found in \cscntLogFacility::<name>
     */
    public function __construct(\cscntLogger $loggerInstance, $logFacility = null)
    {
        $this->loggerInstance = $loggerInstance;
        $this->logFacility    = $logFacility;
    }

    /**
     * Logs with an arbitrary level.
     *
     * @param mixed $level
     * @param string $message
     * @param array $context
     */
    public function log($level, $message, array $context = array())
    {
        if (isset($context['exception']) && $context['exception'] instanceof \Exception) {
            $exception = $context['exception'];
            $message   = $this->composeMessage($message, $context);
            unset($context['exception']);

            $this->loggerInstance->log(
                new Payload\ExceptionWithStringAndContext(
                    $this->mapLogLevelMapping($level),
                    $this->getLogFacility(),
                    null,
                    $exception,
                    $message,
                    $context
                )
            );
            return;
        }

        $this->loggerInstance->log(
            new Payload\StringWithContext(
                $this->mapLogLevelMapping($level),
                $this->getLogFacility(),
                null,
                $this->composeMessage($message, $context),
                $context
            )
        );
    }

    /**
     * Maps the Psr\Log level to the corresponding cscntLogger level
     *
     * @param mixed $level
     * @return int
     */
    protected function mapLogLevelMapping($level)
    {
        switch($level) {
            case Log\LogLevel::WARNING:
            case Log\LogLevel::NOTICE:
                return \cscntLogPayload::SEVERITY_WARNING;
            case Log\LogLevel::INFO:
                return \cscntLogPayload::SEVERITY_INFO;
            case Log\LogLevel::DEBUG:
                return \cscntLogPayload::SEVERITY_DEBUG;
            case Log\LogLevel::ALERT:
            case Log\LogLevel::EMERGENCY:
            case Log\LogLevel::CRITICAL:
            default:
                return \cscntLogPayload::SEVERITY_FATAL;
        }
    }

    /**
     * Returns the LogFacility which should be used. If none was given on construction a default facility will be
     * returned here.
     *
     * @return null|string
     */
    protected function getLogFacility()
    {
        if ($this->logFacility === null) {
            return \cscntLogFacility::UNKNOWN;
        }
        return $this->logFacility;
    }

    /**
     * Composes the message with the given context array and returns it.
     *
     * @param string $message
     * @param array $context
     * @return string
     */
    protected function composeMessage($message, array $context)
    {
        if (empty($context)) {
            return $message;
        }

        $replaceStrings = array();
        foreach($context as $key => $value) {
            if (is_array($value)) {
                continue;
            }

            $replaceStrings['{'.$key.'}'] = $value;
        }

        return str_replace(array_keys($replaceStrings), array_values($replaceStrings), $message);
    }
}
