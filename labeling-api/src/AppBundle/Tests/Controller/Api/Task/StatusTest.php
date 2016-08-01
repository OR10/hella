<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Database\Facade;
use AppBundle\Model;
use AppBundle\Tests;
use AppBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class StatusTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/status/%s';

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\User
     */
    private $user;

    public function testMarkWaitingTaskAsLabeled()
    {
        $this->task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);
        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), Model\LabelingTask::STATUS_DONE])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $task = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertEquals($task->getStatus(Model\LabelingTask::PHASE_LABELING), Model\LabelingTask::STATUS_DONE);
    }

    public function testReopenLabeledTask()
    {
        $this->task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_DONE);
        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), Model\LabelingTask::STATUS_TODO])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $task = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertEquals($task->getStatus(Model\LabelingTask::PHASE_LABELING), Model\LabelingTask::STATUS_TODO);
        $this->assertTrue($task->isReopen());
    }

    public function testBeginTask()
    {
        $this->task->setAssignedUser('');
        $this->task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);

        $response = $this->createRequest('/api/task/%s/status/begin', [$this->task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $task = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertEquals($task->getStatus(Model\LabelingTask::PHASE_LABELING), Model\LabelingTask::STATUS_IN_PROGRESS);
        $this->assertEquals($task->getAssignedUserId(), $this->user->getId());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->projectFacade        = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->addRole(Model\User::ROLE_ADMIN);

        $this->video = $this->videoFacade->save(Model\Video::create('Testvideo'));
        $this->project = $this->projectFacade->save(Model\Project::create('test project'));
        $task = Model\LabelingTask::create(
            $this->video,
            $this->project,
            range(1, 10),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);
        $this->task = $this->labelingTaskFacade->save($task);
    }
}
