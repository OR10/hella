<?php

namespace AppBundle\Tests\Controller\Api\Task;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;

class LabeledThingTest extends Tests\WebTestCase
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

    public function testGetLabeledThingDocument()
    {
        $labelingTask = $this->createLabelingTask();
        $this->createLabeledThingDocument($labelingTask);

        $response = $this->doRequest(
            'GET',
            sprintf(
                '/api/task/%s/labeledThing',
                $labelingTask->getId()
            )
        );


        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testGetNotExistingLabeledThingDocument()
    {
        $response = $this->doRequest(
            'GET',
            sprintf(
                '/api/task/%s/labeledThing',
                '1231239vc890xcv908'
            )
        );


        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testSaveLabeledThingDocument()
    {
        $labelingTask = $this->createLabelingTask();
        $response     = $this->doRequest(
            'POST',
            sprintf(
                '/api/task/%s/labeledThing',
                $labelingTask->getId()
            ),
            json_encode(
                array(
                    'id' => '11aa239108f1419967ed8d6a1f5a765t',
                    'classes' => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor' => 'blue',
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testSaveLabeledThingWithInvalidTaskDocument()
    {
        $response = $this->doRequest(
            'POST',
            sprintf(
                '/api/task/%s/labeledThing',
                'casacsgaaasfcxbx'
            ),
            json_encode(
                array(
                    'id' => '11aa239108f1419967ed8d6a1f5a765t',
                    'classes' => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor' => 'blue',
                )
            )
        );


        $this->assertEquals(404, $response->getStatusCode());
    }

    public function testUpdateLabeledThingDocument()
    {
        $labelingTask  = $this->createLabelingTask();
        $labelingThing = $this->createLabeledThingDocument($labelingTask);
        $response      = $this->doRequest(
            'PUT',
            sprintf(
                '/api/task/%s/labeledThing/%s',
                $labelingTask->getId(),
                $labelingThing->getId()
            ),
            json_encode(
                array(
                    'rev' => $labelingThing->getRev(),
                    'classes' => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor' => 'blue',

                )
            )
        );


        $this->assertEquals(200, $response->getStatusCode());
    }

    public function testUpdateLabeledThingAndDeleteDocument()
    {
        $labelingTask = $this->createLabelingTask(9, 11);
        $labelingThing = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrameBeforeRange = $this->createLabeledInFrameDocument($labelingThing, 9);
        $labeledThingInFrameInRange = $this->createLabeledInFrameDocument($labelingThing, 10);
        $labeledThingInFrameAfterRange = $this->createLabeledInFrameDocument($labelingThing, 11);
        $response = $this->doRequest(
            'PUT',
            sprintf(
                '/api/task/%s/labeledThing/%s',
                $labelingTask->getId(),
                $labelingThing->getId()
            ),
            json_encode(
                array(
                    'rev' => $labelingThing->getRev(),
                    'classes' => array('class1' => 'test'),
                    'incomplete' => true,
                    'frameRange' => array(
                        'startFrameNumber' => 10,
                        'endFrameNumber' => 10,
                    ),
                    'lineColor' => 'blue',
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());

        $labeledThingsOutsideRange = $this->labelingThingInFrameFacade->getLabeledThingInFramesOutsideRange($labelingThing);
        $this->assertEmpty($labeledThingsOutsideRange);

        $labeledThingsInFrame = $this->labelingThingFacade->getLabeledThingInFrames($labelingThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrameInRange, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingMovesLabeledThingInFrameToStartFrameNumberIfLabeledThingDoesNotYetExistForStartFrameNumber()
    {
        $labelingTask        = $this->createLabelingTask(9, 11);
        $labelingThing       = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingThing, 9);

        $response = $this->doRequest(
            'PUT',
            sprintf(
                '/api/task/%s/labeledThing/%s',
                $labelingTask->getId(),
                $labelingThing->getId()
            ),
            json_encode(
                array(
                    'rev' => $labelingThing->getRev(),
                    'classes' => array('class1' => 'test'),
                    'incomplete' => true,
                    'frameRange' => array(
                        'startFrameNumber' => 10,
                        'endFrameNumber' => 10,
                    ),
                    'lineColor' => 'blue',
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());

        $labeledThingsOutsideRange = $this->labelingThingInFrameFacade->getLabeledThingInFramesOutsideRange($labelingThing);
        $this->assertEmpty($labeledThingsOutsideRange);

        $labeledThingsInFrame = $this->labelingThingFacade->getLabeledThingInFrames($labelingThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrame, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingMovesLabeledThingInFrameToEndFrameNumberIfLabeledThingDoesNotYetExistForEndFrameNumber()
    {
        $labelingTask        = $this->createLabelingTask(9, 11);
        $labelingThing       = $this->createLabeledThingDocument($labelingTask);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labelingThing, 11);

        $response = $this->doRequest(
            'PUT',
            sprintf(
                '/api/task/%s/labeledThing/%s',
                $labelingTask->getId(),
                $labelingThing->getId()
            ),
            json_encode(
                array(
                    'rev' => $labelingThing->getRev(),
                    'classes' => array('class1' => 'test'),
                    'incomplete' => true,
                    'frameRange' => array(
                        'startFrameNumber' => 10,
                        'endFrameNumber' => 10,
                    ),
                    'lineColor' => 'blue',
                )
            )
        );

        $this->assertEquals(200, $response->getStatusCode());

        $labeledThingsOutsideRange = $this->labelingThingInFrameFacade->getLabeledThingInFramesOutsideRange($labelingThing);
        $this->assertEmpty($labeledThingsOutsideRange);

        $labeledThingsInFrame = $this->labelingThingFacade->getLabeledThingInFrames($labelingThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrame, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingWithInvalidRevDocument()
    {
        $labelingTask  = $this->createLabelingTask();
        $labelingThing = $this->createLabeledThingDocument($labelingTask);
        $response      = $this->doRequest(
            'PUT',
            sprintf(
                '/api/task/%s/labeledThing/%s',
                $labelingTask->getId(),
                $labelingThing->getId()
            ),
            json_encode(
                array(
                    'rev' => '324jh2jk4hkh234h',
                    'classes' => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor' => 'blue',
                )
            )
        );


        $this->assertEquals(409, $response->getStatusCode());
    }

    public function testDeleteLabeledThingDocument()
    {
        $labelingTask  = $this->createLabelingTask();
        $labelingThing = $this->createLabeledThingDocument($labelingTask);
        $this->createLabeledInFrameDocument($labelingThing, 10, '22dd639108f1419967ed8d6a1f5a765c');
        $response      = $this->doRequest(
            'DELETE',
            sprintf(
                '/api/task/%s/labeledThing/%s?rev=%s',
                $labelingTask->getId(),
                $labelingThing->getId(),
                $labelingThing->getRev()
            )
        );

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

    private function doRequest($method, $url, $content = null)
    {
        $client  = $this->createClient();
        $crawler = $client->request(
            $method,
            $url,
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

    private function createLabelingTask($startRange = 10, $endRange = 20)
    {
        $video = new Model\Video('foobar');
        $this->videoFacade->save($video);
        $frameRange   = new Model\FrameRange($startRange, $endRange);
        $labelingTask = new Model\LabelingTask($video, $frameRange);
        $this->labelingTaskFacade->save($labelingTask);

        return $labelingTask;
    }

    private function createLabeledThingDocument(Model\LabelingTask $labelingTask)
    {
        $labeledThing = new Model\LabeledThing($labelingTask);
        $labeledThing->setId('11aa239108f1419967ed8d6a1f5a765t');
        $this->labelingThingFacade->save($labeledThing);

        return $labeledThing;
    }

    private function createLabeledInFrameDocument(
        Model\LabeledThing $labeledThing,
        $frameNumber = 10,
        $id = null)
    {
        $labeledThingInFrame = new Model\LabeledThingInFrame($labeledThing, $frameNumber);
        if ($id !== null) {
            $labeledThingInFrame->setId($id);
        }
        $this->labelingThingInFrameFacade->save($labeledThingInFrame);

        return $labeledThingInFrame;
    }
}
