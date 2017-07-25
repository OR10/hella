<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Service\TaskDatabaseCreator;
use AnnoStationBundle\Service as AnnoStationBundleService;
use AppBundle\Service;
use Doctrine\ODM\CouchDB;
use MyProject\Proxies\__CG__\OtherProject\Proxies\__CG__\stdClass;

class TaskDatabaseCreatorTest extends Tests\WebTestCase
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

    private function getTaskDatabaseValidateDocUpdateDocumentServiceMock()
    {
        return $this->getMockBuilder(AnnoStationBundleService\TaskDatabaseValidateDocUpdateDocumentService::class)
            ->disableOriginalConstructor()
            ->setMethods(['updateForDatabase'])
            ->getMock();
    }

    public function testSmoke()
    {
        $couchDocumentManagerMock                         = $this->getCouchDocumentManagerMock();
        $couchReplicatorMock                              = $this->getCouchDbReplicatorMock();
        $taskDatabaseValidateDocUpdateDocumentServiceMock = $this->getTaskDatabaseValidateDocUpdateDocumentServiceMock();
        $creator                                          = new TaskDatabaseCreator(
            $couchDocumentManagerMock,
            $couchReplicatorMock,
            $taskDatabaseValidateDocUpdateDocumentServiceMock
        );
        $this->assertInstanceOf(TaskDatabaseCreator::class, $creator);
    }

    public function testCreateDatabaseCreatesCouchDatabase()
    {
        $organisation         = Tests\Helper\OrganisationBuilder::create()->build();
        $project              = Tests\Helper\ProjectBuilder::create($organisation)
            ->withId('Arrested-Development')
            ->build();
        $task                 = Tests\Helper\LabelingTaskBuilder::create(
            $project,
            Tests\Helper\VideoBuilder::create($organisation)->build()
        )->build();
        $expectedDatabaseName = sprintf(
            "taskdb-project-%s-task-%s",
            $project->getId(),
            $task->getId()
        );

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

        $taskDatabaseValidateDocUpdateDocumentServiceMock = $this->getTaskDatabaseValidateDocUpdateDocumentServiceMock(
        );

        $creator               = new TaskDatabaseCreator(
            $documentManagerMock,
            $couchReplicatorMock,
            $taskDatabaseValidateDocUpdateDocumentServiceMock
        );
        $actualDocumentManager = $creator->createDatabase($project, $task);

        $this->assertEquals($actualDocumentManager, $expectedDocumentManager);
    }

    public function testGetDatabaseName()
    {
        $projectId            = "Tim-Taylor";
        $taskId               = "Al-Bundy";
        $expectedDatabaseName = "taskdb-project-$projectId-task-$taskId";

        $documentManagerMock                              = $this->getCouchDocumentManagerMock();
        $couchReplicatorMock                              = $this->getCouchDbReplicatorMock();
        $taskDatabaseValidateDocUpdateDocumentServiceMock = $this->getTaskDatabaseValidateDocUpdateDocumentServiceMock();
        $creator                                          = new TaskDatabaseCreator(
            $documentManagerMock,
            $couchReplicatorMock,
            $taskDatabaseValidateDocUpdateDocumentServiceMock
        );
        $actual                                           = $creator->getDatabaseName($projectId, $taskId);

        $this->assertEquals($expectedDatabaseName, $actual);
    }
}
