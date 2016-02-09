<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Doctrine\ODM\CouchDB;
use JMS\Serializer;
use Symfony\Component\HttpFoundation;

class LabeledThingInFrameTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/labeledThingInFrame/%s';

    const GHOSTS_ROUTE = '/api/task/%s/labeledThingInFrame/%s/%s';

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
    private $labelingThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labelingThingInFrameFacade;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    private $serializer;

    public function testGetLabeledThingInFrameDocument()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $labeledThingInFrame->getFrameNumber()])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testGetLabeledThingsInFrameForMultipleFramesWithoutAnyLabeledThingsInFrame()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 10])
            ->setParameters([
                'labeledThings' => true,
                'offset' => 0,
                'limit' => 3
            ])
            ->execute();


        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    'labeledThings' => [],
                    'labeledThingsInFrame' => [],
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testGetLabeledThingsInFrameForMultipleFramesWithSomeLabeledThingsInFrame()
    {
        $aLabeledThing              = $this->createLabeledThingDocument($this->task);
        $aLabeledThingInFrame       = $this->createLabeledInFrameDocument($aLabeledThing, 11);
        $anotherLabeledThing        = $this->createLabeledThingDocument($this->task);
        $anotherLabeledThingInFrame = $this->createLabeledInFrameDocument($anotherLabeledThing, 12);

        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 10])
            ->setParameters([
                'labeledThings' => true,
                'offset' => 0,
                'limit' => 3
            ])
            ->execute();


        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    'labeledThings' => [
                        $aLabeledThing->getId() => $this->objectToArray($aLabeledThing),
                        $anotherLabeledThing->getId() => $this->objectToArray($anotherLabeledThing),
                    ],
                    'labeledThingsInFrame' => [
                        $this->objectToArray($aLabeledThingInFrame),
                        $this->objectToArray($anotherLabeledThingInFrame),
                    ],
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testGetLabeledThingInFrameDocumentWithInvalidTask()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [111111, $labeledThingInFrame->getFrameNumber()])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrame()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $labeledThingInFrame->getFrameNumber()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody([
                'labeledThingId' => $labeledThing->getId(),
                'classes' => array('class1' => 'test'),
                'shapes'  => array('shape1' => 'test'),
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidBody()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $labeledThingInFrame->getFrameNumber()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody([
                'labeledThingId' => $labeledThing->getId(),
                'classes' => 'invalid_class_string',
                'shapes'  => 'invalid_shapes_string',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidTaskId()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [111111, $labeledThingInFrame->getFrameNumber()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody([
                'classes' => array('class1' => 'test'),
                'shapes'  => array('shape1' => 'test'),
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidFrameNumber()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), 12345])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody([
                'labeledThingId' => $labeledThing->getId(),
                'classes' => array('class1' => 'test'),
                'shapes'  => array('shape1' => 'test'),
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testGetGhostedLabeledThingInFrames()
    {
        $labeledThing                = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrameNumber10 = $this->createLabeledInFrameDocument($labeledThing, 10);
        $labeledThingInFrameNumber11 = $this->createLabeledInFrameDocument($labeledThing, 11);

        $request = $this->createRequest(self::GHOSTS_ROUTE, [$this->task->getId(), 11, $labeledThing->getId()])
            ->setParameters([
                'offset' => -2,
                'limit' => 3,
            ])
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            array(
                'result' => array(
                    array(
                        'id' => null,
                        'rev' => null,
                        'frameNumber' => 9,
                        'classes' => array(),
                        'shapes' => array(),
                        'labeledThingId' => $labeledThingInFrameNumber10->getLabeledThingId(),
                        'incomplete' => true,
                        'ghost' => true,
                        'ghostClasses' => null,
                    ),
                    array(
                        'id' => $labeledThingInFrameNumber10->getId(),
                        'rev' => $labeledThingInFrameNumber10->getRev(),
                        'frameNumber' => 10,
                        'classes' => array(),
                        'shapes' => array(),
                        'labeledThingId' => $labeledThingInFrameNumber10->getLabeledThingId(),
                        'incomplete' => true,
                        'ghost' => false,
                        'ghostClasses' => null,
                    ),
                    array(
                        'id' => $labeledThingInFrameNumber11->getId(),
                        'rev' => $labeledThingInFrameNumber11->getRev(),
                        'frameNumber' => 11,
                        'classes' => array(),
                        'shapes' => array(),
                        'labeledThingId' => $labeledThingInFrameNumber11->getLabeledThingId(),
                        'incomplete' => true,
                        'ghost' => false,
                        'ghostClasses' => null,
                    ),
                )
            ),
            $request->getJsonResponseBody()
        );
    }

    protected function setUpImplementation()
    {
        $this->videoFacade                = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade         = $this->getAnnostationService('database.facade.labeling_task');
        $this->labelingThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labelingThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->serializer                 = $this->getService('serializer');

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
        $this->task = $this->labelingTaskFacade->save($task);
    }

    private function createLabeledThingDocument(Model\LabelingTask $labelingTask)
    {
        return $this->labelingThingFacade->save(Model\LabeledThing::create($labelingTask));
    }

    private function createLabeledInFrameDocument(Model\LabeledThing $labeledThing, $frameNumber = 10)
    {
        return $this->labelingThingInFrameFacade->save(Model\LabeledThingInFrame::create($labeledThing, $frameNumber));
    }

    private function objectToArray($object)
    {
        return json_decode(
            $this->serializer->serialize(
                $object,
                'json',
                Serializer\SerializationContext::create()->setSerializeNull(true)
            ),
            true
        );
    }
}
