<?php

namespace AppBundle\Tests\Controller\Api;

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
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $crawler             = $client->request(
            'GET',
            sprintf('/api/labeledThingInFrame/%s.json', $labeledThingInFrame->getId()),
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

    public function testPutLabeledThingInFrameDocument()
    {
        $client              = $this->createClient();
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $crawler             = $client->request(
            'PUT',
            sprintf('/api/labeledThingInFrame/%s.json', $labeledThingInFrame->getId()),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW'   => Controller\IndexTest::PASSWORD,
                'CONTENT_TYPE'  => 'application/json',
            ],
            json_encode(
                array(
                    'rev'    => $labeledThingInFrame->getRev(),
                    'shapes' => 'newShape',
                )
            )
        );

        $response = json_decode($client->getResponse()->getContent());

        $this->assertEquals('newShape', $response->result->data->shapes);
    }

    public function testDeleteLabeledThingInFrameDocument()
    {
        $client              = $this->createClient();
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $crawler             = $client->request(
            'DELETE',
            sprintf('/api/labeledThingInFrame/%s.json', $labeledThingInFrame->getId()),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW'   => Controller\IndexTest::PASSWORD,
                'CONTENT_TYPE'  => 'application/json',
            ],
            json_encode(
                array(
                    'rev' => $labeledThingInFrame->getRev(),
                )
            )
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

    private function createLabeledInFrameDocument()
    {
        $video = new Model\Video('foobar');
        $this->videoFacade->save($video);
        $frameRange   = new Model\FrameRange(10, 20);
        $labelingTask = new Model\LabelingTask($video, $frameRange);
        $this->labelingTaskFacade->save($labelingTask);
        $labeledThing = new Model\LabeledThing($labelingTask);
        $this->labelingThingFacade->save($labeledThing);
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
        $this->labelingThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }
}