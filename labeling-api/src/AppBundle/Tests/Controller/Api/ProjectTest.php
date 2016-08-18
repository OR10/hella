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
                    array(
                        'name' => 'Test Project in progress',
                        'status' => Model\Project::STATUS_IN_PROGRESS,
                        'finishedPercentage' => 100,
                        'creationTimestamp' => 1468319400,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'videosCount' => 0,
                        'dueTimestamp' => null,
                    ),
                    array(
                        'name' => 'Test Project 3',
                        'status' => Model\Project::STATUS_TODO,
                        'finishedPercentage' => 100,
                        'creationTimestamp' => 1468324800,
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
                        'finishedPercentage' => 100,
                        'creationTimestamp' => 1468321200,
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
                        'finishedPercentage' => 100,
                        'creationTimestamp' => 1468317600,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'videosCount' => 0,
                        'dueTimestamp' => null,
                    ),
                    array(
                        'name' => 'Test Project done',
                        'status' => Model\Project::STATUS_DONE,
                        'finishedPercentage' => 100,
                        'creationTimestamp' => 1468323000,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'videosCount' => 0,
                        'dueTimestamp' => null,
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
        foreach ($projects as $projectData) {
            $project = Model\Project::create($projectData['name'], $projectData['date']);
            $project->setStatus($projectData['status']);
            $this->projectFacade->save($project);
        }

        $request = $this->createRequest('/api/project')->execute();
        $data = array_map(function($project) {
            unset($project['id']);
            return $project;
        }, $request->getJsonResponseBody()['result']);

        $this->assertSame($expectedProjects, $data);
    }

    public function testSetProjectInProgress()
    {
        $project = Model\Project::create('foobar');
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
        $project = Model\Project::create('foobar');
        $project->setStatus(Model\Project::STATUS_IN_PROGRESS);
        $this->projectFacade->save($project);

        $this->createRequest('/api/project/%s/status/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $actualProject = $this->projectFacade->find($project->getId());

        $this->assertSame($actualProject->getStatus(), Model\Project::STATUS_DONE);
    }

    public function testAssignCoordinatorToProject()
    {
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

    public function testSaveProject()
    {
        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'name' => 'Some Test Project',
                    'review' => true,
                    'frameSkip' => 22,
                    'startFrameNumber' => 22,
                    'splitEach' => 600,
                ]
            )
            ->execute()
            ->getResponse();

        $response        = \json_decode($response->getContent(), true);
        $responseProject = $response['result'];

        $this->assertSame($responseProject['name'], 'Some Test Project');
        $this->assertSame($responseProject['labelingValidationProcesses'], ['review']);
        $this->assertSame($responseProject['taskVideoSettings']['frameSkip'], 22);
        $this->assertSame($responseProject['taskVideoSettings']['startFrameNumber'], 22);
        $this->assertSame($responseProject['taskVideoSettings']['splitEach'], 600);
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Project projectFacade */
        $this->projectFacade = $this->getAnnostationService('database.facade.project');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->setRoles([Model\User::ROLE_ADMIN]);
    }
}