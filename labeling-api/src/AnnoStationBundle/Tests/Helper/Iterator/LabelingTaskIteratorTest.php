<?php
namespace AnnoStationBundle\Tests\Helper\Iterator;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Helper\Iterator;
use AppBundle\Model;
use AnnoStationBundle\Tests;
use FOS\UserBundle\Util\UserManipulator;

class LabelingTaskIteratorTest extends Tests\CouchDbTestCase
{
    /**
     * @var Model\Project
     */
    private $firstProject;

    /**
     * @var Model\Project
     */
    private $secondProject;

    /**
     * @var Model\Video
     */
    private $firstVideo;

    /**
     * @var Model\Video
     */
    private $secondVideo;

    /**
     * @var Model\LabelingTask[]
     */
    private $firstProjectTasks;

    /**
     * @var Model\LabelingTask[]
     */
    private $secondProjectTasks;

    private function createIterator(Model\Video $video)
    {
        return new Iterator\LabelingTask($this->labelingTaskFacade, $video);
    }

    public function setUpImplementation()
    {
        parent::setUpImplementation();

        $this->firstVideo    = $this->createVideo($this->createOrganisation(), 'video-id-1');
        $this->secondVideo   = $this->createVideo($this->createOrganisation(), 'video-id-2');
        $this->firstProject  = $this->createProject('project-id-1', $this->createOrganisation());
        $this->secondProject = $this->createProject('project-id-2', $this->createOrganisation());

        $this->firstProjectTasks  = array();
        $this->secondProjectTasks = array();

        $this->firstProjectTasks[] = $this->createTask($this->firstProject, $this->firstVideo);
        $this->firstProjectTasks[] = $this->createTask($this->firstProject, $this->firstVideo);
        $this->firstProjectTasks[] = $this->createTask($this->firstProject, $this->firstVideo);

        $this->secondProjectTasks[] = $this->createTask($this->secondProject, $this->secondVideo);
    }

    public function testImplementsTraversable()
    {
        $iterator = $this->createIterator($this->firstVideo);
        $this->assertSame(
            true,
            $iterator instanceof \Traversable
        );
    }

    public function testIteratesProjectWithOneTask()
    {
        $iterator = $this->createIterator($this->secondVideo);
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
        $iterator = $this->createIterator($this->firstVideo);
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
