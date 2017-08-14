<?php

namespace crosscan\NewRelic;

class SimpleWrapperImplementation extends Wrapper
{
    private $appName;

    private $extensionLoaded;

    /**
     * @param $appName <copy from="new relic api doc">
     *                 The name of the application to name. The string uses the same format as newrelic.appname and can
     *                 set multiple application names by separating each with a semi-colon. However please be aware
     *                 of the restriction on the application name ordering as described for that setting.
     *                 </copy>
     */
    public function __construct($appName)
    {
        $this->appName = $appName;

        $this->extensionLoaded = extension_loaded('newrelic');
    }

    /**
     * @param string $name Optiopnal parameter to set a specific name to the transaction
     * @param bool   $isBackgroundTask optional parameter to flg the transaction as background task.
     *             if set to false (the default) the transactoin will be treated as web request
     * @return void
     */
    public function startTransaction($name = null, $isBackgroundTask = false)
    {
        if (!$this->extensionLoaded) {
            return;
        }

        // make sure the name begins with '/' if set
        if ($name !== null && strpos($name, '/') !== 0) {
            $name = '/' . $name;
        }

        newrelic_set_appname($this->appName);
        newrelic_start_transaction($this->appName);

        if ($name !== null) {
            newrelic_name_transaction($name);
        }

        if ($isBackgroundTask) {
            newrelic_background_job(true);
        }
    }

    /**
     * @param $name
     * @return void
     */
    public function setTransactionName($name)
    {
        if (!$this->extensionLoaded) {
            return;
        }

        if (strpos($name, '/') !== 0) {
            $name = '/' . $name;
        }

        newrelic_name_transaction($name);
    }

    /**
     * End the transaction
     *
     * @return void
     */
    public function endTransaction()
    {
        if (!$this->extensionLoaded) {
            return;
        }

        newrelic_end_transaction();
    }

    /**
     * @param $key the key of the parameter to record
     * @param $value the value to record
     * @return void
     */
    public function addParameter($key, $value)
    {
        if (!$this->extensionLoaded) {
            return;
        }

        newrelic_add_custom_parameter($key, $value);
    }

    /**
     * @param string     $message the message to send to new relic
     * @param \Exception $exception sends an exception to new relic
     * @return void
     */
    public function noticeError($message, \Exception $exception = null)
    {
        if (!$this->extensionLoaded) {
            return;
        }

        if ($exception === null) {
            newrelic_notice_error($message);
        } else {
            newrelic_notice_error($message, $exception);
        }
    }

    public function addMethodTracing($methodName)
    {
        if ($this->extensionLoaded) {
            newrelic_add_custom_tracer($methodName);
        }
    }
}
