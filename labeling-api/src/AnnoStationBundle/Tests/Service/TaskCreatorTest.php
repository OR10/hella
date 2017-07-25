<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Model;
use AnnoStationBundle\Service;
use AppBundle\Tests;

class TaskCreatorTest extends Tests\KernelTestCase
{
    /**
     * @var Service\TaskCreator
     */
    private $taskCreatorService;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    public function testTaskCreation()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $this->organisationFacade->save($organisation);
        $video = Helper\VideoBuilder::create($organisation)->build();
        $this->videoFacade->save($video);
        $project = Helper\ProjectBuilder::create($organisation)
            ->withVideo($video)
            ->withFrameSkip(22)
            ->withStartFrameNumber(22)
            ->build();
        $this->projectFacade->save($project);

        $tasks =$this->taskCreatorService->createTasks($project, $video);

        $task = reset($tasks);
        $metadata = $task->getMetaData();

        $this->assertCount(1, $tasks);
        $this->assertEquals(22, $metadata['frameSkip']);
        $this->assertEquals(22, $metadata['startFrameNumber']);
    }

    public function testImageTaskCreation()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $this->organisationFacade->save($organisation);
        $video = Helper\VideoBuilder::create($organisation)->withFormat('image2')->withNumberOfFrames(1)->build();
        $this->videoFacade->save($video);
        $project = Helper\ProjectBuilder::create($organisation)
            ->withVideo($video)
            ->withFrameSkip(22)
            ->withStartFrameNumber(22)
            ->build();
        $this->projectFacade->save($project);

        $tasks =$this->taskCreatorService->createTasks($project, $video);

        $task = reset($tasks);
        $metadata = $task->getMetaData();

        $this->assertEquals(1, $metadata['frameSkip']);
        $this->assertEquals(1, $metadata['startFrameNumber']);
    }

    public function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->projectFacade      = $this->getAnnostationService('database.facade.project');
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->taskCreatorService = $this->getAnnostationService('service.task_creator');
    }
}
