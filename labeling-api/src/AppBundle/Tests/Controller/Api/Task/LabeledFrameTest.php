<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabeledFrameTest extends Tests\WebTestCase
{
    const ROUTE = "/api/task/%s/labeledFrame/%s";

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\LabelingTask
     */
    private $task;

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
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 10])
            ->setParameters([
                'offset' => 0,
                'limit'  => 3,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 10)),
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 11)),
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 12)),
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testGetMultipleLabeledFramesWithSomeExistingLabeledFrames()
    {
        $labeledFrame11 = $this->createLabeledFrame($this->task, 11);
        $labeledFrame13 = $this->createLabeledFrame($this->task, 13);
        $request        = $this->createRequest(self::ROUTE, [$this->task->getId(), 10])
            ->setParameters([
                'offset' => 0,
                'limit'  => 4,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    $this->serializeObjectAsArray(Model\LabeledFrame::create($this->task, 10)),
                    $this->serializeObjectAsArray($labeledFrame11),
                    $this->serializeObjectAsArray($labeledFrame11->copyToFrameIndex(12)),
                    $this->serializeObjectAsArray($labeledFrame13),
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    protected function setUpImplementation()
    {
        $this->videoFacade        = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledFrameFacade = $this->getAnnostationService('database.facade.labeled_frame');

        $user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $user->addRole(Model\User::ROLE_ADMIN);

        $this->video = $this->videoFacade->save(Model\Video::create('foobar'));
        $task = Model\LabelingTask::create(
            $this->video,
            new Model\FrameRange(10, 20),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::STATUS_WAITING);
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
