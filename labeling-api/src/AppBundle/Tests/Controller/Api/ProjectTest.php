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
                        'status' => Model\Project::STATUS_IN_PROGRESS,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'creationTimestamp' => 1468319400,
                        'dueTimestamp' => null,
                    ),
                    array(
                        'name' => 'Test Project 3',
                        'status' => Model\Project::STATUS_TODO,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'creationTimestamp' => 1468324800,
                        'dueTimestamp' => null,
                    ),
                    array(
                        'name' => 'Test Project 1',
                        'status' => Model\Project::STATUS_TODO,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'creationTimestamp' => 1468321200,
                        'dueTimestamp' => null,
                    ),
                    array(
                        'name' => 'Test Project 2',
                        'status' => Model\Project::STATUS_TODO,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'creationTimestamp' => 1468317600,
                        'dueTimestamp' => null,
                    ),
                    array(
                        'name' => 'Test Project done',
                        'status' => Model\Project::STATUS_DONE,
                        'taskCount' => 0,
                        'taskFinishedCount' => 0,
                        'taskInProgressCount' => 0,
                        'totalLabelingTimeInSeconds' => 0,
                        'labeledThingInFramesCount' => 0,
                        'creationTimestamp' => 1468323000,
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

    protected function setUpImplementation()
    {
        $this->projectFacade = $this->getAnnostationService('database.facade.project');

        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}