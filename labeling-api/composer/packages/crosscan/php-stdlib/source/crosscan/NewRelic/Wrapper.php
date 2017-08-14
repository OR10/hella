<?php

namespace crosscan\NewRelic;

abstract class Wrapper
{
    /**
     * @param string $name Optiopnal parameter to set a specific name to the transaction
     * @param bool $isBackgroundTask optional parameter to flg the transaction as background task.
     *             if set to false (the default) the transactoin will be treated as web request
     * @return void
     */
    public abstract function startTransaction($name = null, $isBackgroundTask = false);

    /**
     * @param $name
     * @return void
     */
    public abstract function setTransactionName($name);

    /**
     * End the transaction
     *
     * @return void
     */
    public abstract function endTransaction();

    /**
     * @param $key the key of the parameter to record
     * @param $value the value to record
     * @return void
     */
    public abstract function addParameter($key, $value);

    /**
     * @param string $message the message to send to new relic
     * @param \Exception $exception sends an exception to new relic
     * @return void
     */
    public abstract function noticeError($message, \Exception $exception);

    /**
     * @param string $methodName the method to trace
     */
    public function addMethodTracing($methodName) {
    }
}
