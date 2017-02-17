<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Controller\Api\Test;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
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
    private $client;

    /**
     * @var Model\User
     */
    private $labelCoordinator;

    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @return array
     */
    public function projectsDataProvider()
    {
        return [
            'projects in progress' => [
                'status'           => Model\Project::STATUS_IN_PROGRESS,
                'expectedProjects' => [
                    [
                        'name'                       => 'Test Project in progress',
                        'status'                     => Model\LabelingTask::STATUS_IN_PROGRESS,
                        'finishedPercentage'         => 0,
                        'creationTimestamp'          => 1468319400,
                        'taskInPreProcessingCount'   => 0,
                        'taskCount'                  => 1,
                        'taskFinishedCount'          => 0,
                        'taskInProgressCount'        => 1,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount'  => 0,
                        'videosCount'                => 1,
                        'dueTimestamp'               => null,
                        'taskFailedCount'            => 0,
                        'coordinator'                => null,
                        'taskInstructionType'        => 'legacy',
                    ],
                ],
            ],
            'projects in todo'     => [
                'status'           => Model\Project::STATUS_TODO,
                'expectedProjects' => [
                    [
                        'name'                       => 'Test Project 3',
                        'status'                     => Model\LabelingTask::STATUS_TODO,
                        'finishedPercentage'         => 0,
                        'creationTimestamp'          => 1468324800,
                        'taskInPreProcessingCount'   => 0,
                        'taskCount'                  => 1,
                        'taskFinishedCount'          => 0,
                        'taskInProgressCount'        => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount'  => 0,
                        'videosCount'                => 1,
                        'dueTimestamp'               => null,
                        'taskFailedCount'            => 0,
                        'coordinator'                => null,
                        'taskInstructionType'        => 'legacy',
                    ],[
                        'name'                       => 'Test Project 1',
                        'status'                     => Model\LabelingTask::STATUS_TODO,
                        'finishedPercentage'         => 0,
                        'creationTimestamp'          => 1468321200,
                        'taskInPreProcessingCount'   => 0,
                        'taskCount'                  => 1,
                        'taskFinishedCount'          => 0,
                        'taskInProgressCount'        => 1,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount'  => 0,
                        'videosCount'                => 1,
                        'dueTimestamp'               => null,
                        'taskFailedCount'            => 0,
                        'coordinator'                => null,
                        'taskInstructionType'        => 'legacy',
                    ],[
                        'name'                       => 'Test Project 2',
                        'status'                     => Model\LabelingTask::STATUS_TODO,
                        'finishedPercentage'         => 0,
                        'creationTimestamp'          => 1468317600,
                        'taskInPreProcessingCount'   => 0,
                        'taskCount'                  => 1,
                        'taskFinishedCount'          => 0,
                        'taskInProgressCount'        => 1,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount'  => 0,
                        'videosCount'                => 1,
                        'dueTimestamp'               => null,
                        'taskFailedCount'            => 0,
                        'coordinator'                => null,
                        'taskInstructionType'        => 'legacy',
                    ],
                ],
            ],
            'projects done'        => [
                'status'           => Model\Project::STATUS_DONE,
                'expectedProjects' => [
                    [
                        'name'                       => 'Test Project done',
                        'status'                     => Model\LabelingTask::STATUS_DONE,
                        'finishedPercentage'         => 100,
                        'creationTimestamp'          => 1468323000,
                        'taskInPreProcessingCount'   => 0,
                        'taskCount'                  => 1,
                        'taskFinishedCount'          => 1,
                        'taskInProgressCount'        => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount'  => 0,
                        'videosCount'                => 1,
                        'dueTimestamp'               => null,
                        'taskFailedCount'            => 0,
                        'coordinator'                => null,
                        'taskInstructionType'        => 'legacy',
                    ],
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
        $this->createProjectsForProjectListTest();

        $request = $this->prepareProjectsByStatusRequest($status)
            ->withCredentialsFromUsername($this->client)
            ->execute();

        $data = array_map(
            function ($project) {
                unset($project['id']);

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
        $video = Tests\Helper\VideoBuilder::create()->build();

        $projectBuilder = Tests\Helper\ProjectBuilder::create()
            ->withProjectOwnedByUserId($this->client->getId());

        $testProject1 = $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project 1')
                ->withCreationDate(new \DateTime('2016-07-12T11:00:00+00:00'))
                ->build()
        );
        $this->taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($testProject1, $video)
                ->withStatus(Model\LabelingTask::PHASE_PREPROCESSING, Model\LabelingTask::STATUS_DONE)
                ->withStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS)
                ->build()
        );

        $testProject2 = $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project 2')
                ->withCreationDate(new \DateTime('2016-07-12T10:00:00+00:00'))
                ->build()
        );
        $this->taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($testProject2, $video)
                ->withStatus(Model\LabelingTask::PHASE_PREPROCESSING, Model\LabelingTask::STATUS_DONE)
                ->withStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE)
                ->withStatus(Model\LabelingTask::PHASE_REVIEW, Model\LabelingTask::STATUS_IN_PROGRESS)
                ->build()
        );

        $testProject3 = $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project 3')
                ->withCreationDate(new \DateTime('2016-07-12T12:00:00+00:00'))
                ->build()
        );
        $this->taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($testProject3, $video)
                ->withStatus(Model\LabelingTask::PHASE_PREPROCESSING, Model\LabelingTask::STATUS_DONE)
                ->withStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO)
                ->build()
        );

        $inProgressProject = $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project in progress')
                ->withStatusChange(Model\Project::STATUS_IN_PROGRESS)
                ->withCreationDate(new \DateTime('2016-07-12T10:30:00+00:00'))
                ->build()
        );
        $this->taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($inProgressProject, $video)
                ->withStatus(Model\LabelingTask::PHASE_PREPROCESSING, Model\LabelingTask::STATUS_DONE)
                ->withStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS)
                ->build()
        );

        $projectAllDone = $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project done')
                ->withStatusChange(Model\Project::STATUS_DONE)
                ->withCreationDate(new \DateTime('2016-07-12T11:30:00+00:00'))
                ->build()
        );
        $this->taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($projectAllDone, $video)
                ->withStatus(Model\LabelingTask::PHASE_PREPROCESSING, Model\LabelingTask::STATUS_DONE)
                ->withStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE)
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
    private function prepareProjectsByStatusRequest(string $status)
    {
        return $this->createRequest(sprintf('/api/project?projectStatus=%s', $status));
    }

    public function testSetProjectInProgress()
    {
        $project = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create()
                ->withCreationDate(new \DateTime('yesterday'))
                ->withProjectOwnedByUserId($this->client->getId())
                ->withAddedCoordinatorAssignment($this->labelCoordinator, new \DateTime('-1 minute'))
                ->build()
        );

        $this->assertEquals($project->getStatus(), Model\Project::STATUS_TODO);
        $this->assertCount(1, $project->getCoordinatorAssignmentHistory());
        $this->assertEquals($this->labelCoordinator->getId(), $project->getCoordinatorAssignmentHistory()[0]['userId']);

        $requestWrapper = $this->createRequest('/api/project/%s/status/accept', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelCoordinator)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals(Model\Project::STATUS_IN_PROGRESS, $project->getStatus());
        $this->assertCount(2, $project->getCoordinatorAssignmentHistory());
        $this->assertEquals($this->labelCoordinator->getId(), $project->getLatestAssignedCoordinatorUserId());
    }

    public function testSetProjectDone()
    {
        $project = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create()
                ->withCreationDate(new \DateTime('yesterday'))
                ->withProjectOwnedByUserId($this->client->getId())
                ->withStatusChange(Model\Project::STATUS_IN_PROGRESS)
                ->build()
        );

        $requestWrapper = $this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->client)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals(Model\Project::STATUS_DONE, $project->getStatus());
    }

    public function testAssignCoordinatorToProject()
    {
        $project = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create()
                ->withProjectOwnedByUserId($this->client->getId())
                ->build()
        );

        $response = $this->createRequest('/api/project/%s/assign', [$project->getId()])
            ->setJsonBody(
                [
                    'assignedLabelCoordinatorId' => $this->labelCoordinator->getId(),
                ]
            )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->client)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals($this->labelCoordinator->getId(), $project->getLatestAssignedCoordinatorUserId());
    }

    public function testSaveLegacyProject()
    {
        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->client)
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
        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->client)
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

        $requestWrapper = $this->prepareProjectsByStatusRequest(Model\Project::STATUS_TODO)
            ->withCredentialsFromUsername($this->labelCoordinator);

        $data = $requestWrapper->execute()->getJsonResponseBody();

        $this->assertSame(0, count($data['result']));

        $project->addCoordinatorAssignmentHistory($this->labelCoordinator);
        $this->projectFacade->save($project);

        $data = $requestWrapper->execute()->getJsonResponseBody();

        $this->assertSame(1, count($data['result']));
    }

    public function testGetProjectsForClientReturnsEmptyProjectListIfClientHasNoProjects()
    {
        $this->projectFacade->save(Tests\Helper\ProjectBuilder::create()->build());

        $responseBody = $this->prepareProjectsByStatusRequest(Model\Project::STATUS_TODO)
            ->withCredentialsFromUsername($this->client)
            ->execute()
            ->getJsonResponseBody();

        $this->assertEquals(Tests\Helper\ProjectListResponseBuilder::create()->build(), $responseBody);
    }

    public function testGetProjectsForClientReturnsOwnProjects()
    {
        $projectBuilder = Tests\Helper\ProjectBuilder::create();

        $project = $this->projectFacade->save(
            $projectBuilder->withProjectOwnedByUserId($this->client->getId())->build()
        );

        $responseBody = $this->prepareProjectsByStatusRequest(Model\Project::STATUS_TODO)
            ->withCredentialsFromUsername($this->client)
            ->execute()
            ->getJsonResponseBody();

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

    public function testDeleteProject()
    {
        $projectBuilder = Tests\Helper\ProjectBuilder::create()
            ->withCreationDate(new \DateTime('2017-02-10 08:00:00', new \DateTimeZone('UTC')))
            ->withProjectOwnedByUserId($this->client->getId())
            ->build();

        $project = $this->projectFacade->save($projectBuilder);

        $requestWrapper = $this->createRequest('/api/project/%s/status/deleted', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->client)
            ->setJsonBody(
                [
                    'message' => 'delete this project pls',
                ]
            )
            ->execute();

        $project = $this->projectFacade->find($project->getId());

        $this->assertTrue($project->isDeleted());
    }

    protected function setUpImplementation()
    {
        $this->projectFacade    = $this->getAnnostationService('database.facade.project');
        $this->taskFacade       = $this->getAnnostationService('database.facade.labeling_task');
        $this->client           = $this->createClientUser();
        $this->labelCoordinator = $this->createLabelCoordinatorUser();
    }
}
