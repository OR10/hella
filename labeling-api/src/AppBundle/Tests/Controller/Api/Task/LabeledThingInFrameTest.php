<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Doctrine\ODM\CouchDB;

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

    /**
     * @var CouchDB\DocumentManager
     */
    private $documentManager;

    public function testGetLabeledThingInFrameDocument()
    {
        $labelingTask        = $this->createLabelingTask();
        $labeledThing        = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->doRequest('GET', $labelingTask->getId(), $labeledThingInFrame->getFrameNumber());


        $this->assertEquals(200, $response->getStatusCode());
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

    public function testSaveLabeledThingInFrameWithInvalidTasked()
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
                'id' => '',
                'rev' => NULL,
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
            array(
                'id' => '',
                'rev' => NULL,
                'frameNumber' => 12,
                'classes' => array(),
                'shapes' => array(),
                'labeledThingId' => $labeledThingInFrameNumber11->getLabeledThingId(),
                'incomplete' => true,
                'ghost' => true,
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
        $this->documentManager           = static::$kernel->getContainer()->get(
            'doctrine_couchdb.odm.default_document_manager'
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

    private function createLabeledThingDocument(Model\LabelingTask $labelingTask)
    {
        $labeledThing = new Model\LabeledThing($labelingTask);
        $uuids        = $this->documentManager->getCouchDBClient()->getUuids();
        $labeledThing->setId(reset($uuids));
        $this->labelingThingFacade->save($labeledThing);

        return $labeledThing;
    }

    private function createLabeledInFrameDocument(Model\LabeledThing $labeledThing, $frameNumber = 10)
    {
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing);
        $uuids               = $this->documentManager->getCouchDBClient()->getUuids();
        $labeledThingInFrame->setId(reset($uuids));
        $labeledThingInFrame->setFrameNumber($frameNumber);
        $this->labelingThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }
}
