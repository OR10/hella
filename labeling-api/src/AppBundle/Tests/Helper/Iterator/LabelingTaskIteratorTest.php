<?php
namespace AppBundle\Tests\Helper\Iterator;

use AppBundle\Database\Facade;
use AppBundle\Helper\Iterator;
use AppBundle\Model;
use AppBundle\Tests;
use FOS\UserBundle\Util\UserManipulator;

class LabelingTaskIteratorTest extends Tests\CouchDbTestCase
{
    /**
     * @var Model\Project
     */
    private $secondProject;

    /**
     * @var Model\Project
     */
    private $firstProject;

    /**
     * @var Model\LabelingTask[]
     */
    private $firstProjectTasks;

    /**
     * @var Model\LabelingTask[]
     */
    private $secondProjectTasks;

    private function createIterator(Model\Project $project)
    {
        return new Iterator\LabelingTask($this->projectFacade, $project);
    }

    public function setUpImplementation()
    {
        parent::setUpImplementation();

        $video               = $this->createVideo('video-id-1');
        $this->firstProject  = $this->createProject('project-id-1');
        $this->secondProject = $this->createProject('project-id-2');

        $this->firstProjectTasks  = array();
        $this->secondProjectTasks = array();

        $this->firstProjectTasks[] = $this->createTask($this->firstProject, $video);
        $this->firstProjectTasks[] = $this->createTask($this->firstProject, $video);
        $this->firstProjectTasks[] = $this->createTask($this->firstProject, $video);

        $this->secondProjectTasks[] = $this->createTask($this->secondProject, $video);
    }

    public function testImplementsTraversable()
    {
        $iterator = $this->createIterator($this->firstProject);
        $this->assertSame(
            true,
            $iterator instanceof \Traversable
        );
    }

    public function testIteratesProjectWithOneTask()
    {
        $iterator = $this->createIterator($this->secondProject);
        $tasks    = array();
        foreach ($iterator as $task) {
            $tasks[] = $task;
        }

        $this->assertEquals(
            $this->secondProjectTasks,
            $tasks
        );
    }

    public function testIteratesProjectWithMultipleTasks()
    {
        $iterator = $this->createIterator($this->firstProject);
        $tasks    = array();
        foreach ($iterator as $task) {
            $tasks[] = $task;
        }

        $this->assertEquals(
            array_reverse($this->firstProjectTasks), // The view seems to reverse the order of the created tasks
            $tasks
        );
    }
}
