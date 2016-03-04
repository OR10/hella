<?php

namespace AppBundle\Tests\Controller\Api;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabeledThingInFrameTest extends Tests\WebTestCase
{
    const ROUTE = '/api/labeledThingInFrame/%s';

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

    /**
     * @var Model\LabeledThing
     */
    private $labeledThing;

    public function testGetLabeledThingInFrameDocument()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testGetLabeledThingInFrameDocumentNotExists()
    {
        $response = $this->createRequest(self::ROUTE, [12345])->execute()->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocument()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => $labeledThingInFrame->getRev(),
                'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                'shapes' => array('shape' => 1),
                'classes' => array('class' => 1),
                'frameNumber' => 15,
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentWithInvalidContent()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => $labeledThingInFrame->getRev(),
                'shapes' => 'shape_as_string',
                'classes' => 'some_class_as_string',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentMissingDocument()
    {
        $response = $this->createRequest(self::ROUTE, [1231231231231])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'labeledThingId' => 'some-non-existing-id',
                'rev' => 'some_rev_',
                'shapes' => array('shape' => 1),
                'classes' => array('class' => 1),
                'frameNumber' => 5,
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentInvalidRevision()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => 'some_invalid_revision',
                'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                'shapes' => array('shape' => 1),
                'classes' => array('class' => 1),
                'frameNumber' => 5,
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentFrameNumberOutOfRange()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody([
                'rev' => $labeledThingInFrame->getRev(),
                'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                'shapes' => array('shape' => 1),
                'classes' => array('class' => 1),
                'frameNumber' => 30,
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocument()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody([
                'rev' => $labeledThingInFrame->getRev(),
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocumentMissingDocument()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [123123123123])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody([
                'rev' => $labeledThingInFrame->getRev(),
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocumentInvalidRevision()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody([
                'rev' => 'invalid_revision',
            ])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade                = $this->getAnnostationService('database.facade.video');
        $this->labelingTaskFacade         = $this->getAnnostationService('database.facade.labeling_task');
        $this->labelingThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labelingThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');

        $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);

        $this->video = $this->videoFacade->save(Model\Video::create('foobar'));
        $task = Model\LabelingTask::create(
            $this->video,
            new Model\FrameRange(10, 20),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setLabelStructure(
            json_decode(
                file_get_contents(
                    sprintf(
                        '%s/../../Resources/LabelStructures/%s-%s.json',
                        __DIR__,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        Model\LabelingTask::INSTRUCTION_PEDESTRIAN
                    )
                ),
                true
            )
        );
        $task->setLabelInstruction(Model\LabelingTask::INSTRUCTION_PEDESTRIAN);
        $this->task  = $this->labelingTaskFacade->save($task);
        $this->labeledThing = $this->labelingThingFacade->save(Model\LabeledThing::create($this->task));
    }

    private function createLabeledThingInFrame($frameNumber = 15)
    {
        return $this->labelingThingInFrameFacade->save(Model\LabeledThingInFrame::create($this->labeledThing, $frameNumber));
    }
}
