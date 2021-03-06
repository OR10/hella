<?php

namespace AnnoStationBundle\Tests\Controller\Api\Organisation;

use AnnoStationBundle\Controller\Api\Test;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use AnnoStationBundle\Model as AnnoStationBundleModel;

class ProjectTest extends Tests\WebTestCase
{
    const ROUTE = '/api/v1/organisation/%s/project';

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Model\User
     */
    private $labelManager;

    /**
     * @var Facade\LabelingTask
     */
    private $taskFacade;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

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
                        'labelManager'               => null,
                        'taskInstructionType'        => 'legacy',
                        'diskUsage'                  => ['total' => 0],
                        'campaigns'                  => [],
                        'labelingGroupId'            => null,
                        'deletedState'               => 'unaccepted',
                        'lastStatusChangeTimestamp'  => 1468409400,
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
                        'labelManager'               => null,
                        'taskInstructionType'        => 'legacy',
                        'diskUsage'                  => ['total' => 0],
                        'campaigns'                  => [],
                        'labelingGroupId'            => null,
                        'deletedState'               => 'unaccepted',
                        'lastStatusChangeTimestamp'  => 1468324800,
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
                        'labelManager'               => null,
                        'taskInstructionType'        => 'legacy',
                        'diskUsage'                  => ['total' => 0],
                        'campaigns'                  => [],
                        'labelingGroupId'            => null,
                        'deletedState'               => 'unaccepted',
                        'lastStatusChangeTimestamp'  => 1468321200,
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
                        'labelManager'               => null,
                        'taskInstructionType'        => 'legacy',
                        'diskUsage'                  => ['total' => 0],
                        'campaigns'                  => [],
                        'labelingGroupId'            => null,
                        'deletedState'               => 'unaccepted',
                        'lastStatusChangeTimestamp'  => 1468317600,
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
                        'labelManager'               => null,
                        'taskInstructionType'        => 'legacy',
                        'diskUsage'                  => ['total' => 0],
                        'campaigns'                  => [],
                        'labelingGroupId'            => null,
                        'deletedState'               => 'unaccepted',
                        'lastStatusChangeTimestamp'  => 1468409400,
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

        $request = $this->prepareProjectsByStatusRequest($this->organisation, $status)
            ->withCredentialsFromUsername($this->labelManager)
            ->execute();

        $data = array_map(
            function ($project) {
                unset($project['id']);
                unset($project['userId']);
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
        $video        = Tests\Helper\VideoBuilder::create($this->organisation)->build();

        $projectBuilder = Tests\Helper\ProjectBuilder::create($this->organisation)
            ->withProjectOwnedByUserId($this->labelManager->getId());
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

        $projectBuilder = Tests\Helper\ProjectBuilder::create($this->organisation)
            ->withProjectOwnedByUserId($this->labelManager->getId());
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

        $projectBuilder = Tests\Helper\ProjectBuilder::create($this->organisation)
            ->withProjectOwnedByUserId($this->labelManager->getId());
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

        $projectBuilder = Tests\Helper\ProjectBuilder::create($this->organisation)
            ->withProjectOwnedByUserId($this->labelManager->getId());
        $inProgressProject = $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project in progress')
                ->withStatusChange(Model\Project::STATUS_IN_PROGRESS, new \DateTime('2016-07-13T11:30:00+00:00'))
                ->withCreationDate(new \DateTime('2016-07-12T10:30:00+00:00'))
                ->build()
        );
        $this->taskFacade->save(
            Tests\Helper\LabelingTaskBuilder::create($inProgressProject, $video)
                ->withStatus(Model\LabelingTask::PHASE_PREPROCESSING, Model\LabelingTask::STATUS_DONE)
                ->withStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS)
                ->build()
        );

        $projectBuilder = Tests\Helper\ProjectBuilder::create($this->organisation)
            ->withProjectOwnedByUserId($this->labelManager->getId());
        $projectAllDone = $this->projectFacade->save(
            $projectBuilder
                ->withName('Test Project done')
                ->withStatusChange(Model\Project::STATUS_DONE, new \DateTime('2016-07-13T11:30:00+00:00'))
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
     * @param AnnoStationBundleModel\Organisation $organisation
     * @param string                              $status
     *
     * @return Tests\RequestWrapper
     */
    private function prepareProjectsByStatusRequest(AnnoStationBundleModel\Organisation $organisation, string $status)
    {
        return $this->createRequest(
            sprintf('/api/v1/organisation/%s/project', $organisation->getId()),
            [],
            null,
            null,
            ['projectStatus' => $status]
        );
    }

    public function testSetProjectInProgress()
    {
        $project      = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create($this->organisation)
                ->withCreationDate(new \DateTime('yesterday'))
                ->withProjectOwnedByUserId($this->labelManager->getId())
                ->withAddedLabelManagerAssignment($this->labelManager, new \DateTime('-1 minute'))
                ->build()
        );

        $this->assertEquals($project->getStatus(), Model\Project::STATUS_TODO);
        $this->assertCount(1, $project->getLabelManagerAssignmentHistory());
        $this->assertEquals($this->labelManager->getId(), $project->getLabelManagerAssignmentHistory()[0]['userId']);

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/project/%s/status/accept',
            [$this->organisation->getId(), $project->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals(Model\Project::STATUS_IN_PROGRESS, $project->getStatus());
        $this->assertCount(2, $project->getLabelManagerAssignmentHistory());
        $this->assertEquals($this->labelManager->getId(), $project->getLatestAssignedLabelManagerUserId());
    }

    public function testSetProjectDone()
    {
        $project      = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create($this->organisation)
                ->withCreationDate(new \DateTime('yesterday'))
                ->withProjectOwnedByUserId($this->labelManager->getId())
                ->withStatusChange(Model\Project::STATUS_IN_PROGRESS)
                ->build()
        );

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/project/%s/status/done',
            [$this->organisation->getId(), $project->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $requestWrapper->getResponse()->getStatusCode());
        $this->assertEquals(Model\Project::STATUS_DONE, $project->getStatus());
    }

    public function testAssignLabelManagerToProject()
    {
        $project      = $this->projectFacade->save(
            Tests\Helper\ProjectBuilder::create($this->organisation)
                ->withProjectOwnedByUserId($this->labelManager->getId())
                ->build()
        );

        $response = $this->createRequest(
            '/api/v1/organisation/%s/project/%s/assign',
            [$this->organisation->getId(), $project->getId()]
        )
            ->setJsonBody(
                [
                    'assignedLabelManagerId' => $this->labelManager->getId(),
                ]
            )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals($this->labelManager->getId(), $project->getLatestAssignedLabelManagerUserId());
    }

    public function testSaveLegacyProject()
    {
        $response = $this->createRequest(self::ROUTE, [$this->organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
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
        $response     = $this->createRequest(self::ROUTE, [$this->organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
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

    public function testDeleteProject()
    {
        $projectBuilder = Tests\Helper\ProjectBuilder::create($this->organisation)
            ->withCreationDate(new \DateTime('2017-02-10 08:00:00', new \DateTimeZone('UTC')))
            ->withProjectOwnedByUserId($this->labelManager->getId())
            ->build();

        $project = $this->projectFacade->save($projectBuilder);

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/project/%s/status/deleted',
            [$this->organisation->getId(), $project->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
            ->setJsonBody(
                [
                    'message' => 'delete this project pls',
                ]
            )
            ->execute();

        $project = $this->projectFacade->find($project->getId());

        $this->assertTrue($project->isDeleted());
    }

    public function testAssignProjectToLabelGroup()
    {
        $projectBuilder    = Tests\Helper\ProjectBuilder::create($this->organisation)
            ->withCreationDate(new \DateTime('2017-06-01 14:00:00', new \DateTimeZone('UTC')))
            ->withProjectOwnedByUserId($this->labelManager->getId())
            ->build();
        $labelGroupBuilder = Tests\Helper\LabelingGroupBuilder::create($this->organisation)->build();

        $project = $this->projectFacade->save($projectBuilder);

        $requestWrapper = $this->createRequest(
            '/api/v1/organisation/%s/project/%s/assignLabelGroup',
            [$this->organisation->getId(), $project->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->withCredentialsFromUsername($this->labelManager)
            ->setJsonBody(
                [
                    'labelGroupId' => $labelGroupBuilder->getId(),
                ]
            )
            ->execute();

        $project = $this->projectFacade->find($project->getId());

        $this->assertEquals($labelGroupBuilder->getId(), $project->getLabelingGroupId());
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Factory\LabelingTask $taskFacadeFactory */
        $taskFacadeFactory        = $this->getAnnostationService('database.facade.factory.labeling_task');
        $this->projectFacade      = $this->getAnnostationService('database.facade.project');
        $this->taskFacade         = $taskFacadeFactory->getReadOnlyFacade();
        $organisationFacade       = $this->getAnnostationService('database.facade.organisation');
        $this->organisation       = $organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());
        $this->labelManager       = $this->createLabelManagerUser($this->organisation);
    }
}
