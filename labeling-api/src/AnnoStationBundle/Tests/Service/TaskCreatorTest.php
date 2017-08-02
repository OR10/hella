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

    /**
     * @var Facade\AdditionalFrameNumberMapping
     */
    private $additionalFrameNumberMappingFacade;

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

        $tasks = $this->taskCreatorService->createTasks($project, $video);

        $task     = reset($tasks);
        $metadata = $task->getMetaData();

        $this->assertEquals(1, $metadata['frameSkip']);
        $this->assertEquals(1, $metadata['startFrameNumber']);
    }

    public function testTaskCreationWithAdditionalWithFrameNumberMapping()
    {
        $organisation = Helper\OrganisationBuilder::create()->build();
        $this->organisationFacade->save($organisation);
        $video = Helper\VideoBuilder::create($organisation)->withName('labeling-video.avi')->build();
        $this->videoFacade->save($video);
        $additionalFrameNumberMapping = Helper\AdditionalFrameNumberMappingBuilder::create($organisation)
            ->withAttachment(__DIR__ . '/VideoImporterFixtures/labeling-video.frame-index.csv')
            ->withFrameNumberMapping([1, 2, 5])->build();
        $this->additionalFrameNumberMappingFacade->save($additionalFrameNumberMapping);
        $project = Helper\ProjectBuilder::create($organisation)
            ->withVideo($video)
            ->withFrameSkip(22)
            ->withStartFrameNumber(22)
            ->withAdditionalFrameNumberMappings([$additionalFrameNumberMapping])
            ->build();
        $this->projectFacade->save($project);

        $tasks = $this->taskCreatorService->createTasks($project, $video);
        /** @var Model\LabelingTask $task */
        $task = reset($tasks);

        $this->assertEquals(array_merge([1, 2, 5], range(22, 660, 22)), $task->getFrameNumberMapping());
    }

    public function setUpImplementation()
    {
        $this->organisationFacade = $this->getAnnostationService('database.facade.organisation');
        $this->projectFacade = $this->getAnnostationService('database.facade.project');
        $this->videoFacade = $this->getAnnostationService('database.facade.video');
        $this->additionalFrameNumberMappingFacade = $this->getAnnostationService(
            'database.facade.additional_frame_number_mapping'
        );
        $this->taskCreatorService = $this->getAnnostationService('service.task_creator');
    }
}
