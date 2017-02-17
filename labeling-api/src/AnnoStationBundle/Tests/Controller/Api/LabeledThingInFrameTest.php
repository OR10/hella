<?php

namespace AnnoStationBundle\Tests\Controller\Api;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabeledThingInFrameTest extends Tests\WebTestCase
{
    const ROUTE = '/api/labeledThingInFrame/%s';

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

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
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    /**
     * @var Model\Video
     */
    private $video;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Model\LabelingTask
     */
    private $task;

    /**
     * @var Model\LabeledThing
     */
    private $labeledThing;


    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

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
        $labeledThingInFrame = Model\LabeledThingInFrame::create($this->labeledThing, 4);
        $response            = $this->createRequest(self::ROUTE, ['foooobar-foooobar-foooobar-foooobar'])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'            => $labeledThingInFrame->getRev(),
                    'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                    'shapes'         => array(
                        array(
                            'id' => '81f32d05-455d-491e-a636-c509aa0aa0e5',
                            'type' => 'rectangle',
                            'topLeft' => array(
                                'x' => 10,
                                'y' => 181,
                            ),
                            'bottomRight' => array(
                                'x' => 110,
                                'y' => 326,
                            ),
                        )
                    ),
                    'classes'        => array('class' => 1),
                    'frameIndex'     => 4,
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentWithInvalidContent()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'     => $labeledThingInFrame->getRev(),
                    'shapes'  => 'shape_as_string',
                    'classes' => 'some_class_as_string',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentMissingDocument()
    {
        $response = $this->createRequest(self::ROUTE, [1231231231231])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'labeledThingId' => 'some-non-existing-id',
                    'rev'            => 'some_rev_',
                    'shapes'         => array('shape' => 1),
                    'classes'        => array('class' => 1),
                    'frameIndex'     => 5,
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentInvalidRevision()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'            => 'some_invalid_revision',
                    'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                    'shapes'         => array('shape' => 1),
                    'classes'        => array('class' => 1),
                    'frameIndex'     => 5,
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    public function testPutLabeledThingInFrameDocumentframeIndexOutOfRange()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'            => $labeledThingInFrame->getRev(),
                    'labeledThingId' => $labeledThingInFrame->getLabeledThingId(),
                    'shapes'         => array('shape' => 1),
                    'classes'        => array('class' => 1),
                    'frameIndex'     => 30,
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocument()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody(
                [
                    'rev' => $labeledThingInFrame->getRev(),
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocumentMissingDocument()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [123123123123])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody(
                [
                    'rev' => $labeledThingInFrame->getRev(),
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testDeleteLabeledThingInFrameDocumentInvalidRevision()
    {
        $labeledThingInFrame = $this->createLabeledThingInFrame();
        $response            = $this->createRequest(self::ROUTE, [$labeledThingInFrame->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody(
                [
                    'rev' => 'invalid_revision',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade                = $this->getAnnostationService('database.facade.video');
        $this->projectFacade              = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade         = $this->getAnnostationService('database.facade.labeling_task');
        $this->labelingThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labelingThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->labelingGroupFacade        = $this->getAnnostationService('database.facade.labeling_group');
        $this->organisationFacade         = $this->getAnnostationService('database.facade.organisation');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->addRole(Model\User::ROLE_LABELER);

        $labelingGroup = $this->labelingGroupFacade->save(Model\LabelingGroup::create([], [$this->user->getId()]));

        $this->organisation =  $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));

        $this->project = Model\Project::create('test project', $this->organisation, $this->user);
        $this->project->setLabelingGroupId($labelingGroup->getId());
        $this->projectFacade->save($this->project);

        $this->video   = $this->videoFacade->save(Model\Video::create($this->organisation, 'foobar'));
        $task          = Model\LabelingTask::create(
            $this->video,
            $this->project,
            range(10, 20),
            Model\LabelingTask::TYPE_OBJECT_LABELING
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $task->addAssignmentHistory(
            Model\LabelingTask::PHASE_LABELING,
            Model\LabelingTask::STATUS_IN_PROGRESS,
            $this->user,
            new \DateTime
        );
        $task->setLabelStructure(
            json_decode(
                file_get_contents(
                    sprintf(
                        '%s/../../Resources/LabelStructures/%s-%s.json',
                        __DIR__,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        Model\LabelingTask::INSTRUCTION_PERSON
                    )
                ),
                true
            )
        );
        $task->setLabelInstruction(Model\LabelingTask::INSTRUCTION_PERSON);
        $this->task         = $this->labelingTaskFacade->save($task);
        $this->labeledThing = $this->labelingThingFacade->save(Model\LabeledThing::create($this->task));
    }

    private function createLabeledThingInFrame($frameIndex = 4)
    {
        return $this->labelingThingInFrameFacade->save(
            Model\LabeledThingInFrame::create($this->labeledThing, $frameIndex)
        );
    }
}
