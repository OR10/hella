<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use JMS\Serializer;
use Symfony\Component\HttpFoundation;

class LabeledFrameTest extends Tests\WebTestCase
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
     * @var Facade\LabeledFrame
     */
    private $labeledFrameFacade;

    private $serializer;

    public function testGetLabeledFrameDocument()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $response     = $this->doRequest('GET', $labelingTask->getId(), $labeledFrame->getFrameNumber());

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testGetLabeledFrameDocumentInvalidTaskId()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $response     = $this->doRequest('GET', 1111, $labeledFrame->getFrameNumber());

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testGetLabeledFrameDocumentInvalidFrameNumber()
    {
        $labelingTask = $this->createLabelingTask();
        $response     = $this->doRequest('GET', $labelingTask->getId(), 1111);

        $this->assertEquals(500, $response->getStatusCode());
    }

    public function testDeleteLabeledFrame()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $response     = $this->doRequest('DELETE', $labelingTask->getId(), $labeledFrame->getFrameNumber());

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testDeleteLabeledFrameInvalidTaskId()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $response     = $this->doRequest('DELETE', 1111, $labeledFrame->getFrameNumber());

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testDeleteLabeledFrameInvalidFrameId()
    {
        $labelingTask = $this->createLabelingTask();
        $response     = $this->doRequest('DELETE', $labelingTask->getId(), 1111);

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testSaveLabeledFrame()
    {
        $labelingTask = $this->createLabelingTask();
        $response = $this->doRequest(
            'PUT',
            $labelingTask->getId(),
            10,
            json_encode(
                array(
                    'id' => '22dd639108f1419967ed8d6a1f5a744b',
                    'classes' => array('class1' => 'test'),
                    'frameNumber' => 10,
                )
            )
        );
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testSaveLabeledFrameWithoutClasses()
    {
        $labelingTask = $this->createLabelingTask();
        $response = $this->doRequest(
            'PUT',
            $labelingTask->getId(),
            10,
            json_encode(
                array(
                    'id' => '22dd639108f1419967ed8d6a1f5a744a',
                    'frameNumber' => 10,
                )
            )
        );
        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testUpdateLabeledFrame()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $response = $this->doRequest(
            'PUT',
            $labelingTask->getId(),
            $labeledFrame->getFrameNumber(),
            json_encode(
                array(
                    'id' => $labeledFrame->getId(),
                    'frameNumber' => $labeledFrame->getFrameNumber(),
                    'rev' => $labeledFrame->getRev()
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testUpdateLabeledFrameWithInvalidRevision()
    {
        $this->markTestIncomplete('Temporary skipping the revision check :(');

        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $response     = $this->doRequest(
            'PUT',
            $labelingTask->getId(),
            $labeledFrame->getFrameNumber(),
            json_encode(
                array(
                    'frameNumber' => 10,
                    'rev' => 'this_revision_invalid'
                )
            )
        );

        $this->assertEquals(409, $response->getStatusCode());
    }

    public function testSaveLabeledFrameWithInvalidBody()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = new Model\LabeledFrame($labelingTask, 10);
        $response = $this->doRequest(
            'PUT',
            $labelingTask->getId(),
            $labeledFrame->getFrameNumber(),
            json_encode(array('invalid' => 'body'))
        );

        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testSaveLabeledFrameWithInvalidFrameNumbers()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = new Model\LabeledFrame($labelingTask, 10);
        $response = $this->doRequest(
            'PUT',
            $labelingTask->getId(),
            $labeledFrame->getFrameNumber(),
            json_encode(
                array(
                    'frameNumber' => 20
                )
            )
        );

        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testSaveLabeledFrameWithInvalidClasses()
    {
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = new Model\LabeledFrame($labelingTask, 10);
        $response = $this->doRequest(
            'PUT',
            $labelingTask->getId(),
            $labeledFrame->getFrameNumber(),
            json_encode(
                array(
                    'classes' => 'test_class',
                    'frameNumber' => 20
                )
            )
        );

        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testGetMultipleLabeledFramesWithoutAnyExistingLabeledFrames()
    {
        $task = $this->createLabelingTask();

        $response = $this->doRequest('GET', $task->getId(), 10, null, ['offset' => 0, 'limit' => 3]);

        $expectedResult = [
            'result' => [
                $this->objectToArray(new Model\LabeledFrame($task, 10)),
                $this->objectToArray(new Model\LabeledFrame($task, 11)),
                $this->objectToArray(new Model\LabeledFrame($task, 12)),
            ],
        ];

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals($expectedResult, json_decode($response->getContent(), true));
    }

    public function testGetMultipleLabeledFramesWithSomeExistingLabeledFrames()
    {
        $task           = $this->createLabelingTask();
        $labeledFrame11 = $this->createLabeledFrame($task, 11);
        $labeledFrame13 = $this->createLabeledFrame($task, 13);

        $response = $this->doRequest('GET', $task->getId(), 10, null, ['offset' => 0, 'limit' => 4]);

        $expectedResult = [
            'result' => [
                $this->objectToArray(new Model\LabeledFrame($task, 10)),
                $this->objectToArray($labeledFrame11),
                $this->objectToArray($labeledFrame11->copyToFrameNumber(12)),
                $this->objectToArray($labeledFrame13),
            ],
        ];

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals($expectedResult, json_decode($response->getContent(), true));
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
        /** @var Facade\LabeledFrame $labeledFrameFacade */
        $this->labeledFrameFacade = static::$kernel->getContainer()->get(
            'annostation.labeling_api.database.facade.labeled_frame'
        );

        $this->serializer = static::$kernel->getContainer()->get('serializer');
    }

    private function doRequest($method, $taskId, $frameNumber, $content = null, $requestParameters = [])
    {
        $client  = $this->createClient();
        $crawler = $client->request(
            $method,
            sprintf(
                '/api/task/%s/labeledFrame/%s.json',
                $taskId,
                $frameNumber
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

    private function createLabeledFrame(Model\LabelingTask $labelingTask, $frameNumber = 10)
    {
        $labeledFrame = new Model\LabeledFrame($labelingTask, $frameNumber);
        $labeledFrame->setClasses(array(
            'foo' => 'bar'
        ));

        $this->labeledFrameFacade->save($labeledFrame);

        return $labeledFrame;
    }

    private function objectToArray($object)
    {
        $context = new Serializer\SerializationContext();
        $context->setSerializeNull(true);

        return json_decode($this->serializer->serialize($object, 'json', $context), true);
    }
}
