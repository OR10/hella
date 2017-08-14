<?php

namespace crosscan\NewRelic;

use Tideways;

/**
 * Wrapper class for the Qafoo Profiler xhprof wrapper
 */
class QafooProfiler extends Wrapper
{
    private $licenceKey;

    /**
     * Creates a new Wrapper for the Qafoo Profiler and automatically starts a transaction if all dependencies are met
     *
     * @param string $licenceKey
     */
    public function __construct($licenceKey)
    {
        $this->licenceKey = $licenceKey;
    }

    /**
     * Since the transaction is started automatically this implementation only sets the transaction name
     *
     * @param string $name Optional parameter to set a specific name to the transaction
     * @param bool   $isBackgroundTask ignored
     *
     * @return void
     */
    public function startTransaction($name = null, $isBackgroundTask = false)
    {
        if (extension_loaded('tideways')) {
            Tideways\Profiler::start($this->licenceKey);
        }

        if ($name !== null) {
            $this->setTransactionName($name);
        }
    }

    public function setTransactionName($name)
    {
        if (!extension_loaded('tideways')) {
            return;
        }

        Tideways\Profiler::setTransactionName($name);
    }

    public function endTransaction()
    {
        if (extension_loaded('tideways')) {
            Tideways\Profiler::stop();
        }
    }

    public function addParameter($key, $value)
    {
        if (extension_loaded('tideways')) {
            Tideways\Profiler::setCustomVariable($key, $value);
        }
    }

    public function noticeError($message, \Exception $exception)
    {
        if (extension_loaded('tideways')) {
            Tideways\Profiler::logFatal($message, $exception->getFile(), $exception->getLine());
        }
    }

    public function addMethodTracing($methodName) {
        if (extension_loaded('tideways')) {
            Tideways\Profiler::watch($methodName);
        }
    }
}
