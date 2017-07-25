<?php

namespace AppBundle\Helper\Monitoring;

use ArrayObject;
use ZendDiagnostics\Check\CheckInterface;
use ZendDiagnostics\Result\ResultInterface;
use ZendDiagnostics\Result\SkipInterface;
use ZendDiagnostics\Result\SuccessInterface;
use ZendDiagnostics\Result\WarningInterface;
use ZendDiagnostics\Runner\Reporter\ReporterInterface;
use ZendDiagnostics\Result\Collection as ResultsCollection;
use AppBundle\Model;
use AppBundle\Service;
use AppBundle\Database\Facade;
use Doctrine\ODM\CouchDB;

class CouchDbReporter implements ReporterInterface
{
    const STATUS_RUNNING = 'running';
    const STATUS_OK = 'ok';
    const STATUS_SKIPPED = 'skipped';
    const STATUS_WARNING = 'warning';
    const STATUS_CRITICAL = 'critical';

    /**
     * @var Model\MonitoringCheckResults
     */
    private $monitoringCheckResults;

    /**
     * @var Facade\Monitoring
     */
    private $monitoringFacade;

    public function __construct(Facade\Monitoring $monitoringFacade)
    {
        $this->monitoringFacade = $monitoringFacade;
    }

    /**
     * This method is called right after Reporter starts running, via Runner::run()
     *
     * @param  ArrayObject $checks       A collection of Checks that will be performed
     * @param  array       $runnerConfig Complete Runner configuration, obtained via Runner::getConfig()
     *
     * @return void
     */
    public function onStart(ArrayObject $checks, $runnerConfig)
    {
        $this->monitoringCheckResults = new Model\MonitoringCheckResults(self::STATUS_RUNNING);
        $this->monitoringFacade->save($this->monitoringCheckResults);
    }

    /**
     * This method is called before each individual Check is performed. If this
     * method returns false, the Check will not be performed (will be skipped).
     *
     * @param  CheckInterface $check      Check instance that is about to be performed.
     * @param  string|null    $checkAlias The alias for the check that is about to be performed
     *
     * @return bool|void      Return false to prevent check from happening
     */
    public function onBeforeRun(CheckInterface $check, $checkAlias = null)
    {
        return;
    }

    /**
     * This method is called every time a Check has been performed. If this method
     * returns false, the Runner will not perform any additional checks and stop
     * its run.
     *
     * @param  CheckInterface  $check      A Check instance that has just finished running
     * @param  ResultInterface $result     Result for that particular check instance
     * @param  string|null     $checkAlias The alias for the check that has just finished
     *
     * @return bool|void       Return false to prevent from running additional Checks
     */
    public function onAfterRun(CheckInterface $check, ResultInterface $result, $checkAlias = null)
    {
        switch (true) {
            case $result instanceof SuccessInterface:
                $status = self::STATUS_OK;
                break;
            case $result instanceof WarningInterface:
                $status = self::STATUS_WARNING;
                break;
            case $result instanceof SkipInterface:
                $status = self::STATUS_SKIPPED;
                break;
            default:
                $status = self::STATUS_CRITICAL;
        }
        $this->monitoringCheckResults->addCheck(
            $checkAlias,
            [
                'checkName' => $check->getLabel(),
                'message'   => $result->getMessage(),
                'status'    => $status,
            ]
        );
    }

    /**
     * This method is called when Runner has been aborted and could not finish the
     * whole run().
     *
     * @param  ResultsCollection $results Collection of Results for performed Checks.
     *
     * @return void
     */
    public function onStop(ResultsCollection $results)
    {
        return;
    }

    /**
     * This method is called when Runner has finished its run.
     *
     * @param  ResultsCollection $results Collection of Results for performed Checks.
     *
     * @return void
     */
    public function onFinish(ResultsCollection $results)
    {
        $globalCheckStatus = self::STATUS_OK;
        foreach ($this->monitoringCheckResults->getChecks() as $check) {
            if ($check['status'] === self::STATUS_WARNING) {
                $globalCheckStatus = self::STATUS_WARNING;
            }
            if ($check['status'] === self::STATUS_CRITICAL) {
                $globalCheckStatus = self::STATUS_CRITICAL;
                break;
            }
        }
        $this->monitoringCheckResults->setGlobalCheckStatus($globalCheckStatus);
        $this->monitoringFacade->save($this->monitoringCheckResults);
    }
}