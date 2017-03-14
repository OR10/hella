<?php

namespace AnnoStationBundle\Tests\Service;

use AppBundle\Tests;
use AnnoStationBundle\Service\TaskDatabaseCreator;
use AppBundle\Service;
use Doctrine\ODM\CouchDB;
use MyProject\Proxies\__CG__\OtherProject\Proxies\__CG__\stdClass;

class TaskDatabaseCreatorTest extends Tests\KernelTestCase
{
    private function getCouchDbClientMock()
    {
        return $this->getMockBuilder(stdClass::class)
            ->setMethods(['createDatabase'])
            ->getMock();
    }

    private function getCouchDbReplicatorMock()
    {
        return $this->getMockBuilder(Service\CouchDbReplicatorService::class)
            ->disableOriginalConstructor()
            ->setMethods(['addReplication'])
            ->getMock();
    }

    private function getCouchDocumentManagerMock()
    {
        return $this->getMockBuilder(CouchDB\DocumentManager::class)
            ->disableOriginalConstructor()
            ->setMethods(['getCouchDBClient'])
            ->getMock();
    }

    public function testSmoke()
    {
        $couchDocumentManagerMock = $this->getCouchDocumentManagerMock();
        $couchReplicatorMock = $this->getCouchDbReplicatorMock();
        $creator = new TaskDatabaseCreator($couchDocumentManagerMock, $couchReplicatorMock);
        $this->assertInstanceOf(TaskDatabaseCreator::class, $creator);
    }

    public function testCreateDatabaseCreatesCouchDatabase()
    {
        $projectId = "Arrested-Development";
        $taskId = "Gilmore-Girls";
        $expectedDatabaseName = "taskdb-project-$projectId-task-$taskId";

        $expectedDocumentManager = 'Document Manager Mock';

        $couchClientMock = $this->getCouchDbClientMock();
        $couchClientMock->expects($this->once())
            ->method('createDatabase')
            ->with($expectedDatabaseName)
            ->willReturn($expectedDocumentManager);

        $couchReplicatorMock = $this->getCouchDbReplicatorMock();

        $documentManagerMock = $this->getCouchDocumentManagerMock();
        $documentManagerMock->expects($this->any())
            ->method('getCouchDBClient')
            ->will($this->returnValue($couchClientMock));

        $creator = new TaskDatabaseCreator($documentManagerMock, $couchReplicatorMock);
        $actualDocumentManager = $creator->createDatabase($projectId, $taskId);

        $this->assertEquals($actualDocumentManager, $expectedDocumentManager);
    }

    public function testCreateDatabaseAddsReplication()
    {
        $projectId = "Arrested-Development";
        $taskId = "Gilmore-Girls";
        $expectedDatabaseName = "taskdb-project-$projectId-task-$taskId";

        $couchReplicatorMock = $this->getCouchDbReplicatorMock();
        $couchReplicatorMock->expects($this->once())
            ->method('addReplication')
            ->with(
                'labeling_api',
                $expectedDatabaseName,
                true,
                'annostation_labeling_task_replication_filter/filter',
                ['taskId' => $taskId]
            );

        $couchClientMock = $this->getCouchDbClientMock();
        $documentManagerMock = $this->getCouchDocumentManagerMock();
        $documentManagerMock->expects($this->any())
            ->method('getCouchDBClient')
            ->willReturn($couchClientMock);

        $creator = new TaskDatabaseCreator($documentManagerMock, $couchReplicatorMock);
        $creator->createDatabase($projectId, $taskId);
    }

    public function testGetDatabaseName()
    {
        $projectId = "Tim-Taylor";
        $taskId = "Al-Bundy";
        $expectedDatabaseName = "taskdb-project-$projectId-task-$taskId";

        $documentManagerMock = $this->getCouchDocumentManagerMock();
        $couchReplicatorMock = $this->getCouchDbReplicatorMock();
        $creator = new TaskDatabaseCreator($documentManagerMock, $couchReplicatorMock);
        $actual =  $creator->getDatabaseName($projectId, $taskId);

        $this->assertEquals($expectedDatabaseName, $actual);
    }
}