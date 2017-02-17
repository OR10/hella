<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabeledFrameTest extends Tests\WebTestCase
{
    const ROUTE = "/api/task/%s/labeledFrame/%s";

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
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

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

    public function testGetLabeledFrameDocument()
    {
        $frame   = $this->createLabeledFrame($this->task);
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $frame->getFrameIndex()])->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
    }

    public function testGetLabeledFrameDocumentInvalidTaskId()
    {
        $frame   = $this->createLabeledFrame($this->task);
        $request = $this->createRequest(self::ROUTE, [1111, $frame->getFrameIndex()])->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $request->getResponse()->getStatusCode());
    }

    public function testGetLabeledFrameDocumentInvalidFrameIndex()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 1111])->execute();

        $this->assertEquals(
            HttpFoundation\Response::HTTP_INTERNAL_SERVER_ERROR,
            $request->getResponse()->getStatusCode()
        );
    }

    public function testDeleteLabeledFrame()
    {
        $frame   = $this->createLabeledFrame($this->task);
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $frame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
    }

    public function testDeleteLabeledFrameInvalidTaskId()
    {
        $frame   = $this->createLabeledFrame($this->task);
        $request = $this->createRequest(self::ROUTE, [1111, $frame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $request->getResponse()->getStatusCode());
    }

    public function testDeleteLabeledFrameInvalidFrameId()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 1111])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $request->getResponse()->getStatusCode());
    }

    public function testSaveLabeledFrame()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 10])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'id' => '22dd639108f1419967ed8d6a1f5a744b',
                'classes' => [
                    'class1' => 'test',
                ],
                'frameIndex' => 10,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
    }

    public function testSaveLabeledFrameWithoutClasses()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 10])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'id' => '22dd639108f1419967ed8d6a1f5a744a',
                'frameIndex' => 10,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
    }

    public function testUpdateLabeledFrame()
    {
        $frame   = $this->createLabeledFrame($this->task);
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $frame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'id'          => $frame->getId(),
                'rev'         => $frame->getRev(),
                'frameIndex' => $frame->getFrameIndex(),
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
    }

    public function testUpdateLabeledFrameWithInvalidRevision()
    {
        $this->markTestIncomplete('Temporary skipping the revision check :(');

        $frame   = $this->createLabeledFrame($this->task);
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $frame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'id'          => $frame->getId(),
                'rev'         => 'this_revision_invalid',
                'frameIndex' => $frame->getFrameIndex(),
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_CONFLICT, $request->getResponse()->getStatusCode());
    }

    public function testSaveLabeledFrameWithInvalidBody()
    {
        $frame   = new Model\LabeledFrame($this->task, 10);
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $frame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'invalid' => 'body',
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $request->getResponse()->getStatusCode());
    }

    public function testSaveLabeledFrameWithInvalidFrameIndex()
    {
        $frame   = Model\LabeledFrame::create($this->task, 10);
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $frame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'frameIndex' => 20,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $request->getResponse()->getStatusCode());
    }

    public function testSaveLabeledFrameWithInvalidClasses()
    {
        $frame = Model\LabeledFrame::create($this->task, 10);
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), $frame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'frameIndex' => 20,
                'classes' => 'test_class',
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $request->getResponse()->getStatusCode());
    }

    public function testGetMultipleLabeledFramesWithoutAnyExistingLabeledFrames()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 8])
            ->setParameters([
                'offset' => 0,
                'limit'  => 3,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 8)),
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 9)),
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 10)),
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testGetMultipleLabeledFramesWithSomeExistingLabeledFrames()
    {
        $labeledFrame1 = $this->createLabeledFrame($this->task, 1);
        $labeledFrame3 = $this->createLabeledFrame($this->task, 3);
        $request        = $this->createRequest(self::ROUTE, [$this->task->getId(), 0])
            ->setParameters([
                'offset' => 0,
                'limit'  => 4,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 0)),
                    $this->serializeObjectAsArray($labeledFrame1),
                    $this->serializeObjectAsArray($labeledFrame1->copyToFrameIndex(2)),
                    $this->serializeObjectAsArray($labeledFrame3),
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    protected function setUpImplementation()
    {
        $this->videoFacade         = $this->getAnnostationService('database.facade.video');
        $this->projectFacade       = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade  = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledFrameFacade  = $this->getAnnostationService('database.facade.labeled_frame');
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');
        $organisationFacade        = $this->getAnnostationService('database.facade.organisation');

        $organisation = $organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->addRole(Model\User::ROLE_LABELER);

        $labelingGroup = $this->labelingGroupFacade->save(Model\LabelingGroup::create([], [$this->user->getId()]));

        $this->project = Model\Project::create('test project', $organisation, $this->user);
        $this->project->setLabelingGroupId($labelingGroup->getId());
        $this->projectFacade->save($this->project);

        $this->video = $this->videoFacade->save(Model\Video::create($organisation, 'foobar'));

        $task = Model\LabelingTask::create(
            $this->video,
            $this->project,
            range(10, 20),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $task->addAssignmentHistory(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            $this->user,
            new \DateTime
        );
        $task->setLabelStructure(
            json_decode(
                file_get_contents(
                    sprintf(
                        '%s/../../../Resources/LabelStructures/%s-%s.json',
                        __DIR__,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        Model\LabelingTask::INSTRUCTION_PERSON
                    )
                ),
                true
            )
        );
        $task->setLabelInstruction(Model\LabelingTask::INSTRUCTION_PERSON);
        $this->task = $this->labelingTaskFacade->save($task);
    }

    private function createLabeledFrame(Model\LabelingTask $task, $frameIndex = 10)
    {
        return $this->labeledFrameFacade->save(
            Model\LabeledFrame::create($this->task, $frameIndex)
                ->setClasses(array('foo' => 'bar'))
        );
    }
}
