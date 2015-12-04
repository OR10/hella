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
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $response            = $this->doRequest(
            'GET',
            $labeledThingInFrame->getId()
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testGetLabeledThingInFrameDocumentNotExists()
    {
        $response            = $this->doRequest(
            'GET',
            12345
        );

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocument()
    {
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $response            = $this->doRequest(
            'PUT',
            $labeledThingInFrame->getId(),
            json_encode(
                array(
                    'rev' => $labeledThingInFrame->getRev(),
                    'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                    'shapes' => array('shape' => 1),
                    'classes' => array('class' => 1),
                    'frameNumber' => 5,
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentWithInvalidContent()
    {
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $response            = $this->doRequest(
            'PUT',
            $labeledThingInFrame->getId(),
            json_encode(
                array(
                    'rev' => $labeledThingInFrame->getRev(),
                    'shapes' => 'shape_as_string',
                    'classes' => 'some_class_as_string',
                )
            )
        );

        $this->assertEquals(400, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentMissingDocument()
    {
        $response            = $this->doRequest(
            'PUT',
            1231231231231,
            json_encode(
                array(
                    'labeledThingId' => 'some-non-existing-id',
                    'rev' => 'some_rev_',
                    'shapes' => array('shape' => 1),
                    'classes' => array('class' => 1),
                    'frameNumber' => 5,
                )
            )
        );

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentInvalidRevision()
    {
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $response            = $this->doRequest(
            'PUT',
            $labeledThingInFrame->getId(),
            json_encode(
                array(
                    'rev' => 'some_invalid_revision',
                    'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                    'shapes' => array('shape' => 1),
                    'classes' => array('class' => 1),
                    'frameNumber' => 5,
                )
            )
        );

        $this->assertEquals(409, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocument()
    {
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $response            = $this->doRequest(
            'DELETE',
            $labeledThingInFrame->getId(),
            json_encode(
                array(
                    'rev' => $labeledThingInFrame->getRev(),
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocumentMissingDocument()
    {
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $response            = $this->doRequest(
            'DELETE',
            123123123123,
            json_encode(
                array(
                    'rev' => $labeledThingInFrame->getRev(),
                )
            )
        );

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocumentInvalidRevision()
    {
        $labeledThingInFrame = $this->createLabeledInFrameDocument();
        $response            = $this->doRequest(
            'DELETE',
            $labeledThingInFrame->getId(),
            json_encode(
                array(
                    'rev' => 'invalid_revision',
                )
            )
        );

        $this->assertEquals(409, $response->getStatusCode());
    }

    private function doRequest($method, $labeledThingInFrameId, $content = null)
    {
        $client              = $this->createClient();
        $crawler             = $client->request(
            $method,
            sprintf('/api/labeledThingInFrame/%s.json', $labeledThingInFrameId),
            [],
            [],
            [
                'PHP_AUTH_USER' => Controller\IndexTest::USERNAME,
                'PHP_AUTH_PW'   => Controller\IndexTest::PASSWORD,
                'CONTENT_TYPE'  => 'application/json',
            ],
            $content
        );

        return $client->getResponse();
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

    private function createLabeledInFrameDocument($frameNumber = 5)
    {
        $video = new Model\Video('foobar');
        $this->videoFacade->save($video);
        $frameRange   = new Model\FrameRange(10, 20);
        $labelingTask = new Model\LabelingTask($video, $frameRange);
        $this->labelingTaskFacade->save($labelingTask);
        $labeledThing = new Model\LabeledThing($labelingTask);
        $labeledThing->setId('11dd639108f1419967ed8d6a1f5a76e7');
        $this->labelingThingFacade->save($labeledThing);
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameNumber);
        $labeledThingInFrame->setId('22dd639108f1419967ed8d6a1f5a765t');
        $this->labelingThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }
}
