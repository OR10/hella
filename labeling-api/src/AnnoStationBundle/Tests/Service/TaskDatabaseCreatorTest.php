<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Service\TaskDatabaseCreator;
use AppBundle\Tests;

class TaskDatabaseCreatorTest extends Tests\KernelTestCase
{
    public function testSmoke()
    {
        $creator = new TaskDatabaseCreator();
        $this->assertInstanceOf(TaskDatabaseCreator::class, $creator);
    }
}