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
     * @varFacade\Project
     */
    private $projectFacade;

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
                        'status' => Model\Project::STATUS_IN_PROGRESS
                    ),
                    array(
                        'name' => 'Test Project 3',
                        'creation_timestamp' => 1468324800,
                        'status' => Model\Project::STATUS_TODO
                    ),
                    array(
                        'name' => 'Test Project 1',
                        'creation_timestamp' => 1468321200,
                        'status' => Model\Project::STATUS_TODO
                    ),
                    array(
                        'name' => 'Test Project 2',
                        'creation_timestamp' => 1468317600,
                        'status' => Model\Project::STATUS_TODO
                    ),
                    array(
                        'name' => 'Test Project done',
                        'creation_timestamp' => 1468323000,
                        'status' => Model\Project::STATUS_DONE
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

    protected function setUpImplementation()
    {
        $this->projectFacade = $this->getAnnostationService('database.facade.project');

        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}