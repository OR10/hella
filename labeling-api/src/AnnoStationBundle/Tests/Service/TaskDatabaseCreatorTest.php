<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Service\TaskDatabaseCreator;
use AppBundle\Tests;
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

    private function getCouchDocumentManagerMock()
    {
        return $this->getMockBuilder(CouchDB\DocumentManager::class)
            ->disableOriginalConstructor()
            ->setMethods(['getCouchDBClient'])
            ->getMock();
    }

    public function testSmoke()
    {
        $couchMock = $this->getCouchDocumentManagerMock();
        $creator = new TaskDatabaseCreator($couchMock);
        $this->assertInstanceOf(TaskDatabaseCreator::class, $creator);
    }

    public function testCreateDatabase()
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

        $documentManagerMock = $this->getCouchDocumentManagerMock();
        $documentManagerMock->expects($this->any())
            ->method('getCouchDBClient')
            ->will($this->returnValue($couchClientMock));

        $creator = new TaskDatabaseCreator($documentManagerMock);
        $actualDocumentManager = $creator->createDatabase($projectId, $taskId);

        $this->assertEquals($actualDocumentManager, $expectedDocumentManager);
    }
}