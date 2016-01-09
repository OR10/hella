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

    private $serializer;

    public function testGetLabeledThingInFrameDocument()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThing        = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->doRequest('GET', $labelingTask->getId(), $labeledThingInFrame->getFrameNumber());


        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testGetLabeledThingsInFrameForMultipleFramesWithoutAnyLabeledThingsInFrame()
    {
        $task = $this->createLabelingTask();

        $response = $this->doRequest(
            'GET',
            $task->getId(),
            10,
            null,
            [
                'labeledThings' => true,
                'offset' => 0,
                'limit' => 3
            ]
        );

        $expectedResult = [
            'result' => [
                'labeledThings' => [],
                'labeledThingsInFrame' => [],
            ],
        ];

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals($expectedResult, json_decode($response->getContent(), true));
    }

    public function testGetLabeledThingsInFrameForMultipleFramesWithSomeLabeledThingsInFrame()
    {
        $task                       = $this->createLabelingTask();
        $aLabeledThing              = $this->createLabeledThingDocument($task);
        $aLabeledThingInFrame       = $this->createLabeledInFrameDocument($aLabeledThing, 11);
        $anotherLabeledThing        = $this->createLabeledThingDocument($task);
        $anotherLabeledThingInFrame = $this->createLabeledInFrameDocument($anotherLabeledThing, 12);

        $response = $this->doRequest(
            'GET',
            $task->getId(),
            10,
            null,
            [
                'labeledThings' => true,
                'offset' => 0,
                'limit' => 3
            ]
        );

        $expectedResult = [
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
        ];

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals($expectedResult, json_decode($response->getContent(), true));
    }

    public function testGetLabeledThingInFrameDocumentWithInvalidTask()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThing        = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->doRequest('GET', 111111, $labeledThingInFrame->getFrameNumber());


        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrame()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThing        = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->doRequest(
            'POST',
            $labelingTask->getId(),
            $labeledThingInFrame->getFrameNumber(),
            json_encode(
                array(
                    'labeledThingId' => $labeledThing->getId(),
                    'classes' => array('class1' => 'test'),
                    'shapes'  => array('shape1' => 'test'),
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidBody()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThing        = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->doRequest(
            'POST',
            $labelingTask->getId(),
            $labeledThingInFrame->getFrameNumber(),
            json_encode(
                array(
                    'labeledThingId' => $labeledThing->getId(),
                    'classes' => 'invalid_class_string',
                    'shapes'  => 'invalid_shapes_string',
                )
            )
        );

        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidTaskId()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThing        = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->doRequest(
            'POST',
            111111,
            $labeledThingInFrame->getFrameNumber(),
            json_encode(
                array(
                    'classes' => array('class1' => 'test'),
                    'shapes'  => array('shape1' => 'test'),
                )
            )
        );

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidFrameNumber()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThing        = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->doRequest(
            'POST',
            $labelingTask->getId(),
            12345,
            json_encode(
                array(
                    'labeledThingId' => $labeledThing->getId(),
                    'classes' => array('class1' => 'test'),
                    'shapes'  => array('shape1' => 'test'),
                )
            )
        );

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testGetGhostedLabeledThingInFrames()
    {
        $labelingTask                = $this->createLabelingTask();
        $labeledThing                = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrameNumber10 = $this->createLabeledInFrameDocument($labeledThing, 10);
        $labeledThingInFrameNumber11 = $this->createLabeledInFrameDocument($labeledThing, 11);


        $client  = $this->createClient();
        $crawler = $client->request(
            'GET',
            sprintf(
                '/api/task/%s/labeledThingInFrame/%s/%s.json?offset=-2&limit=3',
                $labelingTask->getId(),
                11,
                $labeledThing->getId()
            ),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW' => Controller\IndexTest::PASSWORD,
                'CONTENT_TYPE' => 'application/json',
            ]
        );

        $expected = array(
            array(
                'id' => null,
                'rev' => null,
                'frameNumber' => 9,
                'classes' => array(),
                'shapes' => array(),
                'labeledThingId' => $labeledThingInFrameNumber10->getLabeledThingId(),
                'incomplete' => true,
                'ghost' => true,
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
            ),
        );

        $response = $client->getResponse();
        $content  = json_decode($response->getContent(), true);

        $this->assertEquals($expected, $content['result']);

    }

    protected function setUpImplementation()
    {
        $userManipulator = static::$kernel->getContainer()->get('fos_user.util.user_manipulator');
        $userManipulator->create(
            Controller\IndexTest::USERNAME,
            Controller\IndexTest::PASSWORD,
            Controller\IndexTest::EMAIL,
            true,
            false
        );

        /** @var Facade\Video $videoFacade */
        $this->videoFacade = static::$kernel->getContainer()->get('annostation.labeling_api.database.facade.video');
        /** @var Facade\LabelingTask $labelingTaskFacade */
        $this->labelingTaskFacade = static::$kernel->getContainer()->get(
            'annostation.labeling_api.database.facade.labeling_task'
        );
        /** @var Facade\LabeledThing $labelingThingFacade */
        $this->labelingThingFacade = static::$kernel->getContainer()->get(
            'annostation.labeling_api.database.facade.labeled_thing'
        );
        /** @var Facade\LabeledThingInFrame $labelingThingInFrameFacade */
        $this->labelingThingInFrameFacade = static::$kernel->getContainer()->get(
            'annostation.labeling_api.database.facade.labeled_thing_in_frame'
        );

        $this->serializer = static::$kernel->getContainer()->get('serializer');
    }

    private function doRequest($method, $taskId, $labeledThingInFrameNumber, $content = null, $requestParameters = [])
    {
        $client  = $this->createClient();
        $crawler = $client->request(
            $method,
            sprintf(
                '/api/task/%s/labeledThingInFrame/%s.json',
                $taskId,
                $labeledThingInFrameNumber
            ),
            $requestParameters,
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW' => Controller\IndexTest::PASSWORD,
                'CONTENT_TYPE' => 'application/json',
            ],
            $content
        );

        return $client->getResponse();
    }

    private function createLabelingTask()
    {
        $video = new Model\Video('foobar');
        $this->videoFacade->save($video);
        $frameRange   = new Model\FrameRange(10, 20);
        $labelingTask = new Model\LabelingTask($video, $frameRange, Model\LabelingTask::TYPE_OBJECT_LABELING);
        $this->labelingTaskFacade->save($labelingTask);

        return $labelingTask;
    }

    private function createLabeledThingDocument(Model\LabelingTask $labelingTask)
    {
        $labeledThing = new Model\LabeledThing($labelingTask);
        $this->labelingThingFacade->save($labeledThing);

        return $labeledThing;
    }

    private function createLabeledInFrameDocument(Model\LabeledThing $labeledThing, $frameNumber = 10)
    {
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameNumber);
        $this->labelingThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }

    private function objectToArray($object)
    {
        $context = new Serializer\SerializationContext();
        $context->setSerializeNull(true);

        return json_decode($this->serializer->serialize($object, 'json', $context), true);
    }
}
