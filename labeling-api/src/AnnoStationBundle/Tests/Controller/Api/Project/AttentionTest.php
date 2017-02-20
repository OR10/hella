<?php

namespace AnnoStationBundle\Tests\Controller\Api\Project;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade as AppFacade;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Tests\Helper as AppBundleHelper;

class AttentionTest extends Tests\WebTestCase
{
    /**
     * @var Model\LabelingTask[]
     */
    private $tasks;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    public function testListAttentionTasks()
    {
        $response = $this->createRequest(
            '/api/organisation/%s/project/%s/attentionTasks',
            [$this->organisation->getId(), $this->project->getId()],
            'label_coordinator',
            'label_coordinator'
        )
            ->setMethod(HttpFoundation\Request::METHOD_GET)
            ->execute()
            ->getResponse();

        $this->assertEquals(200, $response->getStatusCode());

        $content = \json_decode($response->getContent(), true);

        $expectedTaskIds = array_map(
            function (Model\LabelingTask $task) {
                return $task->getId();
            },
            $this->tasks
        );

        $actualTaskIds = array_map(
            function ($task) {
                return $task['id'];
            },
            $content['result']['tasks']
        );

        sort($expectedTaskIds);
        sort($actualTaskIds);

        $this->assertEquals($expectedTaskIds, $actualTaskIds);
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Video $videoFacade */
        $videoFacade = $this->getAnnostationService('database.facade.video');
        /** @var Facade\Project $projectFacade */
        $projectFacade = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        $organisationFacade       = $this->getAnnostationService('database.facade.organisation');

        $this->organisation  = $organisationFacade->save(Helper\OrganisationBuilder::create()->build());

        $coordinatorUser = $this->createLabelCoordinatorUser($this->organisation);
        $project         = Helper\ProjectBuilder::create($this->organisation)
            ->withAddedCoordinatorAssignment($coordinatorUser);
        $this->project   = $projectFacade->save($project->build());
        $video           = $videoFacade->save(Helper\VideoBuilder::create($this->organisation)->build());

        foreach (range(1, 5) as $tasksWithAttentionFlag) {
            $task          = Helper\LabelingTaskBuilder::create($this->project, $video)->withAttentionTaskFlag();
            $this->tasks[] = $this->labelingTaskFacade->save($task->build());
        }

        foreach (range(1, 5) as $tasksWithoutAttentionFlag) {
            $task = Helper\LabelingTaskBuilder::create($this->project, $video);
            $this->labelingTaskFacade->save($task->build());
        }
    }
}
