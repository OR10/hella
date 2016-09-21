<?php

namespace AppBundle\Tests\Controller\Api\Project;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;

class StatusTest extends Tests\WebTestCase
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Model\User
     */
    private $client;

    /**
     * @var Model\User
     */
    private $labelCoordinator;

    /**
     * @var Model\User
     */
    private $labeler;

    public function testAcceptProject()
    {
        $project       = $this->createProject();
        $labelingGroup = $this->createLabelingGroup($this->labelCoordinator);

        $requestWrapper = $this->createRequest('/api/project/%s/status/accept', [$project->getId()])
            ->withCredentialsFromUsername($this->labelCoordinator)
            ->setJsonBody(
                [
                    'assignedGroupId' => $labelingGroup->getId(),
                ]
            )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $requestWrapper->getResponse()->getStatusCode());
        $this->assertSame(Model\Project::STATUS_IN_PROGRESS, $project->getStatus());
        $this->assertSame($this->labelCoordinator->getId(), $project->getLatestAssignedCoordinatorUserId());
        $this->assertSame($labelingGroup->getId(), $project->getLabelingGroupId());
    }

    public function testDoneProject()
    {
        $project = $this->createProject();

        $requestWrapper = $this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelCoordinator)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $requestWrapper->getResponse()->getStatusCode());
        $this->assertSame(Model\Project::STATUS_DONE, $project->getStatus());
    }

    public function testDoneProjectWithIncompleteTasks()
    {
        $project = $this->createProject();
        $this->createTask($project);

        $response = $this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelCoordinator)
            ->execute();

        $this->assertSame($response->getResponse()->getStatusCode(), 400);
    }

    /**
     * Create a project to run the tests against.
     *
     * @return Model\Project
     */
    private function createProject()
    {
        return $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create()
                ->withName('foobar')
                ->withCreationDate(new \DateTime('yesterday'))
                ->withProjectOwnedByUserId($this->client->getId())
                ->withAddedCoordinatorAssignment($this->labelCoordinator, new \DateTime('yesterday'))
                ->build()
        );
    }

    /**
     * Create and persist a labeling group for the given coordinator with the default labeler.
     *
     * @param Model\User $coordinator
     *
     * @return Model\LabelingGroup
     */
    private function createLabelingGroup(Model\User $coordinator)
    {
        return $this->labelingGroupFacade->save(Model\LabelingGroup::create($coordinator, $this->labeler));
    }

    /**
     * Create and persist a simple task for the given project.
     *
     * @param Model\Project $project
     *
     * @return Model\LabelingTask
     */
    private function createTask(Model\Project $project)
    {
        return $this->labelingTaskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($project, Tests\Helper\VideoBuilder::create()->build())
                ->build()
        );
    }

    protected function setUpImplementation()
    {
        $this->projectFacade       = $this->getAnnostationService('database.facade.project');
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');
        $this->labelingTaskFacade  = $this->getAnnostationService('database.facade.labeling_task');
        $this->client              = $this->createClientUser();
        $this->labelCoordinator    = $this->createLabelCoordinatorUser();
        $this->labeler             = $this->createLabelerUser();
    }
}
