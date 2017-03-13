<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Service\TaskDatabaseCreator;
use AppBundle\Tests;
use Doctrine\ODM\CouchDB;

class TaskDatabaseCreatorTest extends Tests\KernelTestCase
{
    private function getCouchMock()
    {
        $couchMock = $this->getMockBuilder(CouchDB\DocumentManager::class)
            ->disableOriginalConstructor()
//            ->setMethods(['getCouchDBClient'])
            ->getMock();
        return $couchMock;
    }

    public function testSmoke()
    {
        $couchMock = $this->getCouchMock();
        $creator = new TaskDatabaseCreator($couchMock);
        $this->assertInstanceOf(TaskDatabaseCreator::class, $creator);
    }
}