<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabeledThingTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/labeledThing';

    const ITEM_ROUTE = '/api/task/%s/labeledThing/%s';

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    public function testGetLabeledThingDocument()
    {
        $task = $this->createLabelingTask();
        $this->createLabeledThing($task);

        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testGetNotExistingLabeledThingDocument()
    {
        $response = $this->createRequest(self::ROUTE, ['1231239vc890xcv908'])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testSaveLabeledThingDocument()
    {
        $task = $this->createLabelingTask();

        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody([
                'id' => '11aa239108f1419967ed8d6a1f5a765t',
                'classes' => array('class1' => 'test'),
                'incomplete' => true,
                'lineColor' => 'blue',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testSaveLabeledThingWithInvalidTaskDocument()
    {
        $response = $this->createRequest(self::ROUTE, ['casacsgaaasfcxbx'])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody([
                'id' => '11aa239108f1419967ed8d6a1f5a765t',
                'classes' => array('class1' => 'test'),
                'incomplete' => true,
                'lineColor' => 'blue',
            ])
            ->execute()
            ->getResponse();


        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testUpdateLabeledThingDocument()
    {
        $task         = $this->createLabelingTask();
        $labeledThing = $this->createLabeledThing($task);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => $labeledThing->getRev(),
                'classes' => array('class1' => 'test'),
                'incomplete' => true,
                'lineColor' => 'blue',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testUpdateLabeledThingAndDeleteDocument()
    {
        $task                           = $this->createLabelingTask(9, 11);
        $labeledThing                   = $this->createLabeledThing($task);
        $labeledThingInFrameBeforeRange = $this->createLabeledThingInFrame($labeledThing, 9);
        $labeledThingInFrameInRange     = $this->createLabeledThingInFrame($labeledThing, 10);
        $labeledThingInFrameAfterRange  = $this->createLabeledThingInFrame($labeledThing, 11);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => $labeledThing->getRev(),
                'classes' => array('class1' => 'test'),
                'incomplete' => true,
                'frameRange' => array(
                    'startFrameIndex' => 10,
                    'endFrameIndex' => 10,
                ),
                'lineColor' => 'blue',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->assertEmpty($this->labeledThingInFrameFacade->getLabeledThingInFramesOutsideRange($labeledThing));

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrameInRange, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingMovesLabeledThingInFrameToStartFrameIndexIfLabeledThingDoesNotYetExistForStartFrameIndex()
    {
        $task                = $this->createLabelingTask(9, 11);
        $labeledThing        = $this->createLabeledThing($task);
        $labeledThingInFrame = $this->createLabeledThingInFrame($labeledThing, 10);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => $labeledThing->getRev(),
                'classes' => array('class1' => 'test'),
                'incomplete' => true,
                'frameRange' => array(
                    'startFrameIndex' => 10,
                    'endFrameIndex' => 10,
                ),
                'lineColor' => 'blue',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->assertEmpty($this->labeledThingInFrameFacade->getLabeledThingInFramesOutsideRange($labeledThing));

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrame, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingMovesLabeledThingInFrameToEndFrameIndexIfLabeledThingDoesNotYetExistForEndFrameIndex()
    {
        $task                = $this->createLabelingTask(9, 11);
        $labeledThing        = $this->createLabeledThing($task);
        $labeledThingInFrame = $this->createLabeledThingInFrame($labeledThing, 11);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => $labeledThing->getRev(),
                'classes' => array('class1' => 'test'),
                'incomplete' => true,
                'frameRange' => array(
                    'startFrameIndex' => 10,
                    'endFrameIndex' => 10,
                ),
                'lineColor' => 'blue',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->assertEmpty($this->labeledThingInFrameFacade->getLabeledThingInFramesOutsideRange($labeledThing));

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrame, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingWithInvalidRevDocument()
    {
        $task         = $this->createLabelingTask();
        $labeledThing = $this->createLabeledThing($task);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => '324jh2jk4hkh234h',
                'classes' => array('class1' => 'test'),
                'incomplete' => true,
                'lineColor' => 'blue',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    public function testDeleteLabeledThingDocument()
    {
        $task         = $this->createLabelingTask();
        $labeledThing = $this->createLabeledThing($task);

        $this->createLabeledThingInFrame($labeledThing, 10);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setQueryParameters(['rev' => $labeledThing->getRev()])
            ->execute()
            ->getResponse();
        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');

        $user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $user->addRole(Model\User::ROLE_ADMIN);
    }

    private function createLabelingTask($startRange = 10, $endRange = 20)
    {
        $video = $this->videoFacade->save(Model\Video::create('foobar'));
        $task = Model\LabelingTask::create(
            $video,
            new Model\FrameRange($startRange, $endRange),
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
        return $this->labelingTaskFacade->save($task);
    }

    private function createLabeledThing(Model\LabelingTask $task)
    {
        return $this->labeledThingFacade->save(Model\LabeledThing::create($task));
    }

    private function createLabeledThingInFrame(Model\LabeledThing $labeledThing, $frameIndex = 10)
    {
        return $this->labeledThingInFrameFacade->save(Model\LabeledThingInFrame::create($labeledThing, $frameIndex));
    }
}
