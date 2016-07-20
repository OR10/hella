<?php

namespace AppBundle\Tests\Controller\Api;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class ProjectTest extends Tests\WebTestCase
{
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
                        'creation_timestamp' => 1468319400,
                        'status' => Model\Project::STATUS_IN_PROGRESS,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                    ),
                    array(
                        'name' => 'Test Project 3',
                        'creation_timestamp' => 1468324800,
                        'status' => Model\Project::STATUS_TODO,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                    ),
                    array(
                        'name' => 'Test Project 1',
                        'creation_timestamp' => 1468321200,
                        'status' => Model\Project::STATUS_TODO,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                    ),
                    array(
                        'name' => 'Test Project 2',
                        'creation_timestamp' => 1468317600,
                        'status' => Model\Project::STATUS_TODO,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                    ),
                    array(
                        'name' => 'Test Project done',
                        'creation_timestamp' => 1468323000,
                        'status' => Model\Project::STATUS_DONE,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
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
        $this->assertSame($project->getCoordinator(), null);

        $this->createRequest('/api/project/%s/inProgress', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $actualProject = $this->projectFacade->find($project->getId());

        $this->assertSame($actualProject->getStatus(), Model\Project::STATUS_IN_PROGRESS);
        $this->assertSame($actualProject->getCoordinator(), $this->user->getId());
    }

    public function testSetProjectDone()
    {
        $project = Model\Project::create('foobar');
        $project->setStatus(Model\Project::STATUS_IN_PROGRESS);
        $this->projectFacade->save($project);

        $this->createRequest('/api/project/%s/done', [$project->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute();

        $actualProject = $this->projectFacade->find($project->getId());

        $this->assertSame($actualProject->getStatus(), Model\Project::STATUS_DONE);
    }

    protected function setUpImplementation()
    {
        /** @var Facade\Project projectFacade */
        $this->projectFacade = $this->getAnnostationService('database.facade.project');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}