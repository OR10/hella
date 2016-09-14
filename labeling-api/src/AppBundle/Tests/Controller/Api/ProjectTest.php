<?php

namespace AppBundle\Tests\Controller\Api;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class ProjectTest extends Tests\WebTestCase
{
    const ROUTE = '/api/project';

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\User
     */
    private $userFacade;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @return array
     */
    public function projectsDataProvider()
    {
        $inProgressBuilder = Tests\Helper\ProjectBuilder::create()->withStatusChange(Model\Project::STATUS_IN_PROGRESS);
        $todoBuilder       = Tests\Helper\ProjectBuilder::create()->withStatusChange(Model\Project::STATUS_TODO);
        $doneBuilder       = Tests\Helper\ProjectBuilder::create()->withStatusChange(Model\Project::STATUS_DONE);

        return [
            'projects in progress' => [
                'status'           => Model\Project::STATUS_IN_PROGRESS,
                'expectedProjects' => [
                    $inProgressBuilder->withName('Test Project in progress')->buildArray(),
                ],
            ],
            'projects in todo'     => [
                'status'           => Model\Project::STATUS_TODO,
                'expectedProjects' => [
                    $todoBuilder->withName('Test Project 3')->buildArray(),
                    $todoBuilder->withName('Test Project 1')->buildArray(),
                    $todoBuilder->withName('Test Project 2')->buildArray(),
                ],
            ],
            'projects done'        => [
                'status'           => Model\Project::STATUS_DONE,
                'expectedProjects' => [
                    $doneBuilder->withName('Test Project done')->buildArray(),
                ],
            ],
        ];
    }

    /**
     * @dataProvider projectsDataProvider
     *
     * @param string $status
     * @param array  $expectedProjects
     */
    public function testProjectList(string $status, array $expectedProjects)
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $this->createProjectsForProjectListTest();

        $request = $this->requestProjectsByStatus($status);
        $data    = array_map(
            function ($project) {
                $project['id']                = null;
                $project['creationTimestamp'] = 0;

                return $project;
            },
            $request->getJsonResponseBody()['result']
        );

        $this->assertEquals($expectedProjects, $data);
    }

    /**
     * Create a bunch of projects for testing project list by status.
     */
    private function createProjectsForProjectListTest()
    {
        $projectBuilder = Tests\Helper\ProjectBuilder::create();

        $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project 1')
                ->withCreationDate(new \DateTime('2016-07-12T11:00:00+00:00'))
                ->build()
        );

        $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project 2')
                ->withCreationDate(new \DateTime('2016-07-12T10:00:00+00:00'))
                ->build()
        );

        $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project 3')
                ->withCreationDate(new \DateTime('2016-07-12T12:00:00+00:00'))
                ->build()
        );

        $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project in progress')
                ->withStatusChange(Model\Project::STATUS_IN_PROGRESS)
                ->withCreationDate(new \DateTime('2016-07-12T10:30:00+00:00'))
                ->build()
        );

        $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project done')
                ->withStatusChange(Model\Project::STATUS_DONE)
                ->withCreationDate(new \DateTime('2016-07-12T11:30:00+00:00'))
                ->build()
        );
    }

    /**
     * Helper method to request projects of a given status.
     *
     * @param string $status
     *
     * @return Tests\RequestWrapper
     */
    private function requestProjectsByStatus(string $status)
    {
        return $this->createRequest(sprintf('/api/project?projectStatus=%s', $status))->execute();
    }

    public function testSetProjectInProgress()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $project = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create()
                ->withCreationDate(new \DateTime('yesterday'))
                ->build()
        );

        $this->assertEquals($project->getStatus(), Model\Project::STATUS_TODO);
        $this->assertNull($project->getCoordinatorAssignmentHistory());

        $this->createRequest('/api/project/%s/status/accept', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $this->assertEquals(Model\Project::STATUS_IN_PROGRESS, $project->getStatus());
        $this->assertEquals($this->user->getId(), $project->getLatestAssignedCoordinatorUserId());
    }

    public function testSetProjectDone()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $project = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create()
                ->withCreationDate(new \DateTime('yesterday'))
                ->withStatusChange(Model\Project::STATUS_IN_PROGRESS)
                ->build()
        );

        $this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $this->assertEquals(Model\Project::STATUS_DONE, $project->getStatus());
    }

    public function testAssignCoordinatorToProject()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $project = $this->projectFacade->save(Tests\Helper\ProjectBuilder::create()->build());

        $coordinator = $this->userFacade->updateUser(
            Tests\Helper\UserBuilder::createDefaultLabelCoordinator()->build()
        );

        $response = $this->createRequest('/api/project/%s/assign', [$project->getId()])
            ->setJsonBody(
                [
                    'assignedLabelCoordinatorId' => $coordinator->getId(),
                ]
            )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals($coordinator->getId(), $project->getLatestAssignedCoordinatorUserId());
    }

    public function testSaveLegacyProject()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'name'                     => 'Some Test Project',
                    'review'                   => true,
                    'frameSkip'                => 22,
                    'startFrameNumber'         => 22,
                    'splitEach'                => 600,
                    'projectType'              => 'legacy',
                    'vehicle'                  => true,
                    'drawingToolVehicle'       => 'cuboid3d',
                    'person'                   => true,
                    'drawingToolPerson'        => 'cuboid3d',
                    'cyclist'                  => true,
                    'drawingToolCyclist'       => 'cuboid3d',
                    'ignore'                   => true,
                    'drawingToolIgnore'        => 'cuboid3d',
                    'ignore-vehicle'           => true,
                    'drawingToolIgnoreVehicle' => 'cuboid3d',
                    'lane'                     => true,
                    'drawingToolLane'          => 'cuboid3d',
                ]
            )
            ->execute()
            ->getResponse();

        $response                       = \json_decode($response->getContent(), true);
        $responseProject                = $response['result'];
        $expectedLegacyTaskInstructions = [
            [
                'instruction' => 'vehicle',
                'drawingTool' => 'cuboid3d',
            ],
            [
                'instruction' => 'person',
                'drawingTool' => 'cuboid3d',
            ],
            [
                'instruction' => 'cyclist',
                'drawingTool' => 'cuboid3d',
            ],
            [
                'instruction' => 'ignore',
                'drawingTool' => 'cuboid3d',
            ],
            [
                'instruction' => 'ignore-vehicle',
                'drawingTool' => 'cuboid3d',
            ],
            [
                'instruction' => 'lane',
                'drawingTool' => 'cuboid3d',
            ],
        ];

        $this->assertSame($responseProject['name'], 'Some Test Project');
        $this->assertSame($responseProject['labelingValidationProcesses'], ['review']);
        $this->assertSame($responseProject['taskVideoSettings']['frameSkip'], 22);
        $this->assertSame($responseProject['taskVideoSettings']['startFrameNumber'], 22);
        $this->assertSame($responseProject['taskVideoSettings']['splitEach'], 600);
        $this->assertSame($responseProject['taskInstructions']['legacy'], $expectedLegacyTaskInstructions);
    }

    public function testSaveGenericXmlProject()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'name'                   => 'Some Test Project',
                    'review'                 => true,
                    'frameSkip'              => 22,
                    'startFrameNumber'       => 22,
                    'splitEach'              => 600,
                    'projectType'            => 'genericXml',
                    'taskTypeConfigurations' => [
                        [
                            'type'                => 'vehicle',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type'                => 'person',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type'                => 'cyclist',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type'                => 'ignore',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type'                => 'ignore-vehicle',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type'                => 'lane',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                    ],
                ]
            )
            ->execute()
            ->getResponse();

        $response                           = \json_decode($response->getContent(), true);
        $responseProject                    = $response['result'];
        $expectedGenericXmlTaskInstructions = [
            [
                'instruction'         => 'vehicle',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction'         => 'person',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction'         => 'cyclist',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction'         => 'ignore',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction'         => 'ignore-vehicle',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction'         => 'lane',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
        ];

        $this->assertSame($responseProject['name'], 'Some Test Project');
        $this->assertSame($responseProject['labelingValidationProcesses'], ['review']);
        $this->assertSame($responseProject['taskVideoSettings']['frameSkip'], 22);
        $this->assertSame($responseProject['taskVideoSettings']['startFrameNumber'], 22);
        $this->assertSame($responseProject['taskVideoSettings']['splitEach'], 600);
        $this->assertSame($responseProject['taskInstructions']['genericXml'], $expectedGenericXmlTaskInstructions);
    }

    public function testGetProjectsForLabelCoordinator()
    {
        $project = $this->projectFacade->save(Tests\Helper\ProjectBuilder::create()->build());

        $this->user->setRoles([Model\User::ROLE_LABEL_COORDINATOR]);

        $request = $this->requestProjectsByStatus(Model\Project::STATUS_TODO);
        $data    = $request->getJsonResponseBody();

        $this->assertSame(0, count($data['result']));

        $project->addCoordinatorAssignmentHistory($this->user);
        $this->projectFacade->save($project);

        $request = $this->requestProjectsByStatus(Model\Project::STATUS_TODO);
        $data    = $request->getJsonResponseBody();

        $this->assertSame(1, count($data['result']));
    }

    public function testGetProjectsForClientReturnsEmptyProjectListIfClientHasNoProjects()
    {
        $this->user->setRoles([Model\User::ROLE_CLIENT]);

        $this->projectFacade->save(Tests\Helper\ProjectBuilder::create()->build());

        $responseBody = $this->requestProjectsByStatus(Model\Project::STATUS_TODO)->getJsonResponseBody();

        $this->assertEquals(Tests\Helper\ProjectListResponseBuilder::create()->build(), $responseBody);
    }

    public function testGetProjectsForClientReturnsOwnProjects()
    {
        $this->user->setRoles([Model\User::ROLE_CLIENT]);

        $projectBuilder = Tests\Helper\ProjectBuilder::create();

        $project = $this->projectFacade->save(
            $projectBuilder->withProjectOwnedByUserId($this->user->getId())->build()
        );

        $responseBody         = $this->requestProjectsByStatus(Model\Project::STATUS_TODO)->getJsonResponseBody();
        $expectedResponseBody = Tests\Helper\ProjectListResponseBuilder::create()
            ->withProjects(
                [
                    $projectBuilder
                        ->withId($project->getId())
                        ->withCreationDate(date_create()->setTimestamp($project->getCreationDate()))
                        ->buildArray(),
                ]
            )
            ->build();

        $this->assertEquals($expectedResponseBody, $responseBody);
    }

    protected function setUpImplementation()
    {
        $this->projectFacade = $this->getAnnostationService('database.facade.project');
        $this->userFacade    = $this->getAnnostationService('database.facade.user');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}
