<?php

namespace AnnoStationBundle\Tests\Controller\Api\Project;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Tests\Helper;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
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

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    public function testAcceptProject()
    {
        $organisation  = $this->createOrganisation();
        $project       = $this->createProject($organisation);
        $labelingGroup = $this->createLabelingGroup($this->labelCoordinator);

        $requestWrapper = $this->createRequest(
            '/api/organisation/%s/project/%s/status/accept',
            [$organisation->getId(), $project->getId()]
        )
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
        $organisation = $this->createOrganisation();
        $project      = $this->createProject($organisation);

        $requestWrapper = $this->createRequest(
            '/api/organisation/%s/project/%s/status/done',
            [$organisation->getId(), $project->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelCoordinator)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $requestWrapper->getResponse()->getStatusCode());
        $this->assertSame(Model\Project::STATUS_DONE, $project->getStatus());
    }

    public function testDoneProjectWithIncompleteTasks()
    {
        $organisation = $this->createOrganisation();
        $project = $this->createProject($organisation);
        $this->createTask($organisation, $project);

        $response = $this->createRequest(
            '/api/organisation/%s/project/%s/status/done',
            [$organisation->getId(), $project->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelCoordinator)
            ->execute();

        $this->assertSame($response->getResponse()->getStatusCode(), 400);
    }

    /**
     * @return AnnoStationBundleModel\Organisation
     */
    private function createOrganisation()
    {
        return $this->organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());
    }

    /**
     * Create a project to run the tests against.
     *
     * @param AnnoStationBundleModel\Organisation $organisation
     *
     * @return Model\Project
     */
    private function createProject(AnnoStationBundleModel\Organisation $organisation)
    {
        return $this->projectFacade->save(
            Helper\ProjectBuilder::create($organisation)
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
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param Model\Project                       $project
     *
     * @return Model\LabelingTask
     */
    private function createTask(AnnoStationBundleModel\Organisation $organisation, Model\Project $project)
    {
        return $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, Helper\VideoBuilder::create($organisation)->build())
                ->build()
        );
    }

    protected function setUpImplementation()
    {
        $this->projectFacade       = $this->getAnnostationService('database.facade.project');
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');
        $this->labelingTaskFacade  = $this->getAnnostationService('database.facade.labeling_task');
        $this->organisationFacade  = $this->getAnnostationService('database.facade.organisation');
        $this->client              = $this->createClientUser();
        $this->labelCoordinator    = $this->createLabelCoordinatorUser();
        $this->labeler             = $this->createLabelerUser();
    }
}
