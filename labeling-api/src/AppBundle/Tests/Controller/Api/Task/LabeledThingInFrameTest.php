<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;

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

    public function testGetLabeledThingInFrameDocument()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingTask);

        $response = $this->doRequest('GET', $labelingTask->getId(), $labeledThingInFrame->getFrameNumber());


        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testGetLabeledThingInFrameDocumentWithInvalidTask()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingTask);

        $response = $this->doRequest('GET', 111111, $labeledThingInFrame->getFrameNumber());


        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrame()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingTask);

        $response = $this->doRequest(
            'POST',
            $labelingTask->getId(),
            $labeledThingInFrame->getFrameNumber(),
            json_encode(
                array(
                    'labeledThingId' => '11aa239108f1419967ed8d6a1f5a765t',
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
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingTask);

        $response = $this->doRequest(
            'POST',
            $labelingTask->getId(),
            $labeledThingInFrame->getFrameNumber(),
            json_encode(
                array(
                    'labeledThingId' => '11aa239108f1419967ed8d6a1f5a765t',
                    'classes' => 'invalid_class_string',
                    'shapes'  => 'invalid_shapes_string',
                )
            )
        );

        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidTasked()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingTask);

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
    }

    private function doRequest($method, $labelingTaskId, $labeledThingInFrameNumber, $content = null)
    {
        $client  = $this->createClient();
        $crawler = $client->request(
            $method,
            sprintf(
                '/api/task/%s/labeledThingInFrame/%s.json',
                $labelingTaskId,
                $labeledThingInFrameNumber
            ),
            [],
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
        $labelingTask = new Model\LabelingTask($video, $frameRange);
        $this->labelingTaskFacade->save($labelingTask);

        return $labelingTask;
    }

    private function createLabeledInFrameDocument(Model\LabelingTask $labelingTask)
    {
        $labeledThing = new Model\LabeledThing($labelingTask);
        $labeledThing->setId('11aa239108f1419967ed8d6a1f5a765t');
        $this->labelingThingFacade->save($labeledThing);
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
        $labeledThingInFrame->setId('22dd639108f1419967ed8d6a1f5a765c');
        $labeledThingInFrame->setFrameNumber(10);
        $this->labelingThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }
}
