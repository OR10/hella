<?php

namespace crosscan\NewRelic;

/**
 * Wrapper class encapsulating multiple other Wrappers and delegating calls to all of them
 */
class Aggregated extends Wrapper
{
    /**
     * @var Wrapper[]
     */
    private $wrappers;

    public function __construct(array $wrappers)
    {
        foreach ($wrappers as $wrapper) {
            if (!$wrapper instanceof Wrapper) {
                throw new \Exception(
                    sprintf('Expected instance of \crosscan\NewRelic\Wrapper but got %s', get_class($wrapper))
                );
            }
        }
        $this->wrappers = $wrappers;
    }

    public function startTransaction($name = null, $isBackgroundTask = false)
    {
        foreach ($this->wrappers as $wrapper) {
            $wrapper->startTransaction($name, $isBackgroundTask);
        }
    }

    public function setTransactionName($name)
    {
        foreach ($this->wrappers as $wrapper) {
            $wrapper->setTransactionName($name);
        }
    }

    public function endTransaction()
    {
        foreach ($this->wrappers as $wrapper) {
            $wrapper->endTransaction();
        }
    }

    public function addParameter($key, $value)
    {
        foreach ($this->wrappers as $wrapper) {
            $wrapper->addParameter($key, $value);
        }
    }

    public function noticeError($message, \Exception $exception)
    {
        foreach ($this->wrappers as $wrapper) {
            $wrapper->noticeError($message, $exception);
        }
    }

    public function addMethodTracing($method)
    {
        foreach ($this->wrappers as $wrapper) {
            $wrapper->addMethodTracing($method);
        }
    }
}
