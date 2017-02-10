<?php

namespace AnnoStationBundle\Tests\Service\ProjectImporter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AnnoStationBundle\Worker\JobInstruction;
use AnnoStationBundle\Worker\Jobs;
use AppBundle\Model;
use AppBundle\Tests;
use crosscan\WorkerPool;
use crosscan\WorkerPool\AMQP;


class ImportTest extends Tests\KernelTestCase
{
    /**
     * @var Service\ProjectImporter\Import
     */
    private $projectImporterService;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var WorkerPool\Facade
     */
    private $workerPoolFacade;

    public function testImport()
    {
        $jobs = [];
        $this->workerPoolFacade->expects($this->any())->method('addJob')->with(
            $this->callback(
                function ($job) use (&$jobs) {
                    if ($job instanceof Jobs\ThingImporter) {
                        $jobs['ThingImporter'][] = $job;

                        return true;
                    }elseif ($job instanceof Jobs\VideoFrameSplitter) {
                        $jobs['VideoFrameSplitter'][] = $job;

                        return true;
                    }

                    return false;
                }
            )
        );

        $tasks = $this->projectImporterService->importXml(
            __DIR__ . '/TestFiles/SMPC16C00103_SE-OOX687_20150629_185715_rgb_c.avi.xml',
            $this->defaultUser
        );

        $project = $this->projectFacade->findByName('Das wird ein Test');

        $this->assertInstanceOf('AppBundle\Model\Project', $project);

        $taskConfigurationId = $project->getRequirementsXmlTaskInstructions()[0]['taskConfigurationId'];

        $taskConfiguration = $this->taskConfigurationFacade->find($taskConfigurationId);

        $this->assertEquals(
            file_get_contents(__DIR__ . '/TestFiles/TestConfig.xml'),
            $taskConfiguration->getRawData()
        );

        $firstTask = reset($tasks);

        $this->assertInstanceOf('AppBundle\Model\LabelingTask', $firstTask);

        $this->assertCount(2, $jobs['VideoFrameSplitter']);
        $this->assertCount(1, $jobs['ThingImporter']);
    }

    public function setUpImplementation()
    {
        $this->workerPoolFacade = $this->getMockBuilder(AMQP\FacadeAMQP::class)
            ->disableOriginalConstructor()
            ->getMock();
        $this->getContainer()->set(
            sprintf(self::ANNOSTATION_SERVICE_PATTERN, 'vendor.worker_pool.amqp'),
            $this->workerPoolFacade
        );

        $this->projectImporterService  = $this->getAnnostationService('service.project_importer.import');
        $this->projectFacade           = $this->getAnnostationService('database.facade.project');
        $this->taskConfigurationFacade = $this->getAnnostationService('database.facade.task_configuration');
        $this->createDefaultUser();
    }
}