<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;

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

    public function testGetLabeledFrameDocument()
    {
        $client       = $this->createClient();
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $crawler      = $client->request(
            'GET',
            sprintf(
                '/api/task/%s/labeledFrame/%s.json',
                $labelingTask->getId(),
                $labeledFrame->getFrameNumber()
            ),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW' => Controller\IndexTest::PASSWORD,
            ]
        );

        $response = $client->getResponse();

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testSaveLabeledFrame()
    {
        $client       = $this->createClient();
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = new Model\LabeledFrame($labelingTask);
        $labeledFrame->setFrameNumber(10);
        $crawler = $client->request(
            'PUT',
            sprintf(
                '/api/task/%s/labeledFrame/%s.json',
                $labelingTask->getId(),
                $labeledFrame->getFrameNumber()
            ),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW' => Controller\IndexTest::PASSWORD,
            ]
        );

        $response = $client->getResponse();

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testDeleteLabeledFrame()
    {
        $client       = $this->createClient();
        $labelingTask = $this->createLabelingTask();
        $labeledFrame = $this->createLabeledFrame($labelingTask);
        $crawler      = $client->request(
            'DELETE',
            sprintf(
                '/api/task/%s/labeledFrame/%s.json',
                $labelingTask->getId(),
                $labeledFrame->getFrameNumber()
            ),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW' => Controller\IndexTest::PASSWORD,
            ]
        );

        $response = $client->getResponse();

        $this->assertEquals(200, $response->getStatusCode());
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

    private function createLabeledFrame(Model\LabelingTask $labelingTask)
    {
        $labeledFrame = new Model\LabeledFrame($labelingTask);
        $labeledFrame->setFrameNumber(10);
        $labeledFrame->setClasses(array(
            'foo' => 'bar'
        ));

        $this->labeledFrameFacade->save($labeledFrame);

        return $labeledFrame;
    }
}
