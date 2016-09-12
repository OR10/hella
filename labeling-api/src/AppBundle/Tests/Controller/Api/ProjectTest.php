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
     * @var Model\User
     */
    private $user;

    /**
     * @return array
     */
    public function projectsDataProvider()
    {
        return array(
            array(
                array(
                    array(
                        'name' => 'Test Project in progress',
                        'date' => new \DateTime('2016-07-12 10:30:00', new \DateTimeZone('UTC')),
                        'status' => Model\Project::STATUS_IN_PROGRESS
                    ),
                    array(
                        'name' => 'Test Project done',
                        'date' => new \DateTime('2016-07-12 11:30:00', new \DateTimeZone('UTC')),
                        'status' => Model\Project::STATUS_DONE
                    ),
                    array(
                        'name' => 'Test Project 1',
                        'date' => new \DateTime('2016-07-12 11:00:00', new \DateTimeZone('UTC')),
                        'status' => Model\Project::STATUS_TODO
                    ),
                    array(
                        'name' => 'Test Project 2',
                        'date' => new \DateTime('2016-07-12 10:00:00', new \DateTimeZone('UTC')),
                        'status' => Model\Project::STATUS_TODO
                    ),
                    array(
                        'name' => 'Test Project 3',
                        'date' => new \DateTime('2016-07-12 12:00:00', new \DateTimeZone('UTC')),
                        'status' => Model\Project::STATUS_TODO
                    ),
                ),
                array(
                    Model\Project::STATUS_IN_PROGRESS =>
                        array(
                            array(
                                'name' => 'Test Project in progress',
                                'status' => Model\Project::STATUS_IN_PROGRESS,
                                'finishedPercentage' => 0,
                                'creationTimestamp' => 1468319400,
                                'taskInPreProcessingCount' => 0,
                                'taskCount' => 0,
                                'taskFinishedCount' => 0,
                                'taskInProgressCount' => 0,
                                'totalLabelingTimeInSeconds' => 0,
                                'labeledThingInFramesCount' => 0,
                                'videosCount' => 0,
                                'dueTimestamp' => null,
                            ),
                        ),
                    Model\Project::STATUS_TODO =>
                        array(

                            array(
                                'name' => 'Test Project 3',
                                'status' => Model\Project::STATUS_TODO,
                                'finishedPercentage' => 0,
                                'creationTimestamp' => 1468324800,
                                'taskInPreProcessingCount' => 0,
                                'taskCount' => 0,
                                'taskFinishedCount' => 0,
                                'taskInProgressCount' => 0,
                                'totalLabelingTimeInSeconds' => 0,
                                'labeledThingInFramesCount' => 0,
                                'videosCount' => 0,
                                'dueTimestamp' => null,
                            ),
                            array(
                                'name' => 'Test Project 1',
                                'status' => Model\Project::STATUS_TODO,
                                'finishedPercentage' => 0,
                                'creationTimestamp' => 1468321200,
                                'taskInPreProcessingCount' => 0,
                                'taskCount' => 0,
                                'taskFinishedCount' => 0,
                                'taskInProgressCount' => 0,
                                'totalLabelingTimeInSeconds' => 0,
                                'labeledThingInFramesCount' => 0,
                                'videosCount' => 0,
                                'dueTimestamp' => null,
                            ),
                            array(
                                'name' => 'Test Project 2',
                                'status' => Model\Project::STATUS_TODO,
                                'finishedPercentage' => 0,
                                'creationTimestamp' => 1468317600,
                                'taskInPreProcessingCount' => 0,
                                'taskCount' => 0,
                                'taskFinishedCount' => 0,
                                'taskInProgressCount' => 0,
                                'totalLabelingTimeInSeconds' => 0,
                                'labeledThingInFramesCount' => 0,
                                'videosCount' => 0,
                                'dueTimestamp' => null,
                            ),
                        ),
                    Model\Project::STATUS_DONE =>
                        array(
                            array(
                                'name' => 'Test Project done',
                                'status' => Model\Project::STATUS_DONE,
                                'finishedPercentage' => 0,
                                'creationTimestamp' => 1468323000,
                                'taskInPreProcessingCount' => 0,
                                'taskCount' => 0,
                                'taskFinishedCount' => 0,
                                'taskInProgressCount' => 0,
                                'totalLabelingTimeInSeconds' => 0,
                                'labeledThingInFramesCount' => 0,
                                'videosCount' => 0,
                                'dueTimestamp' => null,
                            ),
                        ),
                )
            )
        );
    }

    /**
     * @dataProvider projectsDataProvider
     *
     * @param $projects
     * @param $expectedProjects
     */
    public function testProjectList($projects, $expectedProjects)
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        foreach ($projects as $projectData) {
            $project = Model\Project::create($projectData['name'], null, $projectData['date']);
            $project->addStatusHistory(null, new \DateTime(), $projectData['status']);
            $this->projectFacade->save($project);
        }

        foreach ($expectedProjects as $status => $expectedProjectsForState) {
            $request = $this->createRequest('/api/project?projectStatus=' . $status)->execute();
            $data    = array_map(function ($project) {
                unset($project['id']);
                return $project;
            }, $request->getJsonResponseBody()['result']);

            $this->assertSame($expectedProjectsForState, $data);
        }
    }

    public function testSetProjectInProgress()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $project = Model\Project::create('foobar', $this->user, new \DateTime('2016-09-08', new \DateTimeZone('UTC')));
        $this->projectFacade->save($project);

        $this->assertSame($project->getStatus(), Model\Project::STATUS_TODO);
        $this->assertSame($project->getCoordinatorAssignmentHistory(), null);

        $this->createRequest('/api/project/%s/status/accept', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $actualProject = $this->projectFacade->find($project->getId());

        $this->assertSame($actualProject->getStatus(), Model\Project::STATUS_IN_PROGRESS);
        $this->assertSame($actualProject->getLatestAssignedCoordinatorUserId(), $this->user->getId());
    }

    public function testSetProjectDone()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $project = Model\Project::create('foobar', $this->user, new \DateTime('2016-09-08'));
        $project->addStatusHistory(null, new \DateTime(), Model\Project::STATUS_IN_PROGRESS);
        $this->projectFacade->save($project);

        $this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $actualProject = $this->projectFacade->find($project->getId());

        $this->assertSame($actualProject->getStatus(), Model\Project::STATUS_DONE);
    }

    public function testAssignCoordinatorToProject()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $project = Model\Project::create('foobar');
        $this->projectFacade->save($project);

        /** @var Model\User $coordinator */
        $coordinator = $this->getService('fos_user.util.user_manipulator')
            ->create('foobar_label_coordinator', self::PASSWORD, self::EMAIL, true, false);
        $coordinator->setRoles([Model\User::ROLE_LABEL_COORDINATOR]);

        $this->createRequest('/api/project/%s/assign', [$project->getId()])
            ->setJsonBody(
                [
                    'assignedLabelCoordinatorId' => $coordinator->getId(),
                ]
            )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $actualProject = $this->projectFacade->find($project->getId());
        $this->assertSame($actualProject->getLatestAssignedCoordinatorUserId(), $coordinator->getId());
    }

    public function testSaveLegacyProject()
    {
        $this->user->setRoles([Model\User::ROLE_ADMIN, Model\User::ROLE_CLIENT]);

        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'name' => 'Some Test Project',
                    'review' => true,
                    'frameSkip' => 22,
                    'startFrameNumber' => 22,
                    'splitEach' => 600,
                    'projectType' => 'legacy',
                    'vehicle' => true,
                    'drawingToolVehicle' => 'cuboid3d',
                    'person' => true,
                    'drawingToolPerson' => 'cuboid3d',
                    'cyclist' => true,
                    'drawingToolCyclist' => 'cuboid3d',
                    'ignore' => true,
                    'drawingToolIgnore' => 'cuboid3d',
                    'ignore-vehicle' => true,
                    'drawingToolIgnoreVehicle' => 'cuboid3d',
                    'lane' => true,
                    'drawingToolLane' => 'cuboid3d',
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
                    'name' => 'Some Test Project',
                    'review' => true,
                    'frameSkip' => 22,
                    'startFrameNumber' => 22,
                    'splitEach' => 600,
                    'projectType' => 'genericXml',
                    'taskTypeConfigurations' => [
                        [
                            'type' => 'vehicle',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type' => 'person',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type' => 'cyclist',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type' => 'ignore',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type' => 'ignore-vehicle',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                        [
                            'type' => 'lane',
                            'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
                        ],
                    ]
                ]
            )
            ->execute()
            ->getResponse();

        $response                           = \json_decode($response->getContent(), true);
        $responseProject                    = $response['result'];
        $expectedGenericXmlTaskInstructions = [
            [
                'instruction' => 'vehicle',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction' => 'person',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction' => 'cyclist',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction' => 'ignore',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction' => 'ignore-vehicle',
                'taskConfigurationId' => '18d07df7d2a2e4441192f403841ebf45',
            ],
            [
                'instruction' => 'lane',
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
        $project = Model\Project::create('Test Project');
        $this->projectFacade->save($project);

        $this->user->setRoles([Model\User::ROLE_LABEL_COORDINATOR]);

        $request = $this->createRequest('/api/project?projectStatus=todo')->execute();
        $data    = $request->getJsonResponseBody();

        $this->assertSame(0, count($data['result']));

        $project->addCoordinatorAssignmentHistory($this->user);
        $this->projectFacade->save($project);

        $request = $this->createRequest('/api/project?projectStatus=todo')->execute();
        $data    = $request->getJsonResponseBody();

        $this->assertSame(1, count($data['result']));
    }

    public function testGetProjectsForClient()
    {
        $project = Model\Project::create('Test Project');
        $this->projectFacade->save($project);

        $this->user->setRoles([Model\User::ROLE_CLIENT]);

        $request = $this->createRequest('/api/project?projectStatus=todo')->execute();
        $data    = $request->getJsonResponseBody();

        $this->assertSame(0, $data['totalRows']);

        $project->setUserId($this->user->getId());
        $this->projectFacade->save($project);

        $request = $this->createRequest('/api/project?projectStatus=todo')->execute();
        $data    = $request->getJsonResponseBody();

        $this->assertSame(1, $data['totalRows']);
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Project projectFacade */
        $this->projectFacade = $this->getAnnostationService('database.facade.project');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}
