<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use AppBundle\Helper\Monitoring;
use AppBundle\Database\Facade;
use AppBundle\Model;

class MonitoringTest extends Tests\WebTestCase
{
    public function testGetLatestMonitoringResultAsSuperAdminStatusOk()
    {
        /** @var Facade\Monitoring $monitoringFacade */
        $monitoringFacade = $this->getAnnostationService('database.facade.monitoring');;
        $this->couchdbClient->deleteDatabase('monitoring');
        $this->couchdbClient->createDatabase('monitoring');

        $monitoringFacade->save(new Model\MonitoringCheckResults(Monitoring\CouchDbReporter::STATUS_OK));

        $requestWrapper = $this->createRequest('/api/monitoring')
            ->withCredentialsFromUsername($this->createSuperAdminUser())
            ->execute();

        $result = $requestWrapper->getJsonResponseBody()['result'];

        $this->assertEquals(200, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals(Monitoring\CouchDbReporter::STATUS_OK, $result['globalCheckStatus']);
        $this->couchdbClient->deleteDatabase('monitoring');
    }

    public function testGetLatestMonitoringResultAsSuperAdminStatusCritical()
    {
        /** @var Facade\Monitoring $monitoringFacade */
        $monitoringFacade = $this->getAnnostationService('database.facade.monitoring');;
        $this->couchdbClient->deleteDatabase('monitoring');
        $this->couchdbClient->createDatabase('monitoring');

        $monitoringFacade->save(new Model\MonitoringCheckResults(Monitoring\CouchDbReporter::STATUS_CRITICAL));

        $requestWrapper = $this->createRequest('/api/monitoring')
            ->withCredentialsFromUsername($this->createSuperAdminUser())
            ->execute();

        $result = $requestWrapper->getJsonResponseBody()['result'];

        $this->assertEquals(502, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals(Monitoring\CouchDbReporter::STATUS_CRITICAL, $result['globalCheckStatus']);
        $this->couchdbClient->deleteDatabase('monitoring');
    }

    public function testGetLatestMonitoringResultAsAdmin()
    {
        $this->couchdbClient->deleteDatabase('monitoring');
        $this->couchdbClient->createDatabase('monitoring');
        $requestWrapper = $this->createRequest('/api/monitoring')
            ->withCredentialsFromUsername($this->createAdminUser())
            ->execute();

        $this->assertEquals(403, $requestWrapper->getResponse()->getStatusCode());
        $this->couchdbClient->deleteDatabase('monitoring');
    }
}