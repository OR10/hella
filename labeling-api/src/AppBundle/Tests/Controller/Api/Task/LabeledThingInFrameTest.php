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
        $client              = $this->createClient();
        $labelingTask        = $this->createLabelingTask();
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingTask);
        $crawler             = $client->request(
            'GET',
            sprintf(
                '/api/task/%s/labeledThingInFrame/%s.json',
                $labelingTask->getId(),
                $labeledThingInFrame->getFrameNumber()
            ),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW'   => Controller\IndexTest::PASSWORD,
            ]
        );

        $response = $client->getResponse();

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrame()
    {
        $client              = $this->createClient();
        $labelingTask        = $this->createLabelingTask();
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingTask);
        $crawler             = $client->request(
            'POST',
            sprintf(
                '/api/task/%s/labeledThingInFrame/%s.json',
                $labelingTask->getId(),
                $labeledThingInFrame->getFrameNumber()
            ),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW'   => Controller\IndexTest::PASSWORD,
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
        /** @var Facade\LabeledThing $labelingThingFacade */
        $this->labelingThingFacade = static::$kernel->getContainer()->get(
            'annostation.labeling_api.database.facade.labeled_thing'
        );
        /** @var Facade\LabeledThingInFrame $labelingThingInFrameFacade */
        $this->labelingThingInFrameFacade = static::$kernel->getContainer()->get(
            'annostation.labeling_api.database.facade.labeled_thing_in_frame'
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

    private function createLabeledInFrameDocument(Model\LabelingTask $labelingTask)
    {
        $labeledThing = new Model\LabeledThing($labelingTask);
        $this->labelingThingFacade->save($labeledThing);
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
        $labeledThingInFrame->setFrameNumber(10);
        $this->labelingThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }
}