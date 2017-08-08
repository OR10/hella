<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use Symfony\Component\HttpFoundation;

class StatusTest extends Tests\WebTestCase
{
    const ROUTE = '/api/v1/task/%s/status/%s';

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
        $response = $this->createRequest(self::ROUTE, [ $this->task->getId(), Model\LabelingTask::STATUS_TODO])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $task = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testBeginTask()
    {
        $this->task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);

        $response = $this->createRequest('/api/v1/task/%s/status/begin', [$this->task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->execute()
            ->getResponse();

        $task = $this->labelingTaskFacade->find($this->task->getId());

        $this->assertEquals(
            $task->getStatus(Model\LabelingTask::PHASE_LABELING),
            Model\LabelingTask::STATUS_IN_PROGRESS
        );
        $this->assertEquals(
            $task->getLatestAssignedUserIdForPhase(Model\LabelingTask::PHASE_LABELING),
            $this->user->getId()
        );
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->projectFacade      = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        $organisationFacade       = $this->getAnnostationService('database.facade.organisation');

        $organisation = $organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->addRole(Model\User::ROLE_ADMIN);

        $this->video   = $this->videoFacade->save(Model\Video::create($organisation, 'Testvideo'));
        $this->project = $this->projectFacade->save(Model\Project::create('test project', $organisation));
        $task          = Model\LabelingTask::create(
            $this->video,
            $this->project,
            range(1, 10),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_TODO);
        $this->task = $this->labelingTaskFacade->save($task);
    }
}
