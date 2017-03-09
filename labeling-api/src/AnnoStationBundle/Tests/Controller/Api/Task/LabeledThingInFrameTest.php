<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
use Doctrine\ODM\CouchDB;
use JMS\Serializer;
use Symfony\Component\HttpFoundation;

class LabeledThingInFrameTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/labeledThingInFrame/%s';

    const GHOSTS_ROUTE = '/api/task/%s/labeledThingInFrame/%s/%s';

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

    private $serializer;

    public function testGetLabeledThingInFrameDocument()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $labeledThingInFrame->getFrameIndex()])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testGetLabeledThingsInFrameForMultipleFramesWithoutAnyLabeledThingsInFrame()
    {
        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 10])
            ->setParameters(
                [
                    'labeledThings' => true,
                    'offset'        => 0,
                    'limit'         => 3,
                ]
            )
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    'labeledThings'        => [],
                    'labeledThingsInFrame' => [],
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testGetLabeledThingsInFrameForMultipleFramesWithSomeLabeledThingsInFrame()
    {
        $aLabeledThing              = $this->createLabeledThingDocument($this->task);
        $aLabeledThingInFrame       = $this->createLabeledInFrameDocument($aLabeledThing, 9);
        $anotherLabeledThing        = $this->createLabeledThingDocument($this->task);
        $anotherLabeledThingInFrame = $this->createLabeledInFrameDocument($anotherLabeledThing, 10);

        $request = $this->createRequest(self::ROUTE, [$this->task->getId(), 9])
            ->setParameters(
                [
                    'labeledThings' => true,
                    'offset'        => 0,
                    'limit'         => 3,
                ]
            )
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            [
                'result' => [
                    'labeledThings'        => [
                        $aLabeledThing->getId()       => $this->objectToArray($aLabeledThing),
                        $anotherLabeledThing->getId() => $this->objectToArray($anotherLabeledThing),
                    ],
                    'labeledThingsInFrame' => [
                        $this->objectToArray($aLabeledThingInFrame),
                        $this->objectToArray($anotherLabeledThingInFrame),
                    ],
                ],
            ],
            $request->getJsonResponseBody()
        );
    }

    public function testGetLabeledThingInFrameDocumentWithInvalidTask()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [111111, $labeledThingInFrame->getFrameIndex()])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrame()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $labeledThingInFrame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'labeledThingId' => $labeledThing->getId(),
                    'classes'        => array('class1' => 'test'),
                    'shapes'         => array('shape1' => 'test'),
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidBody()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), $labeledThingInFrame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'labeledThingId' => $labeledThing->getId(),
                    'classes'        => 'invalid_class_string',
                    'shapes'         => 'invalid_shapes_string',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidTaskId()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [111111, $labeledThingInFrame->getFrameIndex()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'classes' => array('class1' => 'test'),
                    'shapes'  => array('shape1' => 'test'),
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testSaveLabeledThingInFrameWithInvalidFrameIndex()
    {
        $labeledThing        = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrame = $this->createLabeledInFrameDocument($labeledThing);

        $response = $this->createRequest(self::ROUTE, [$this->task->getId(), 12345])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'labeledThingId' => $labeledThing->getId(),
                    'classes'        => array('class1' => 'test'),
                    'shapes'         => array('shape1' => 'test'),
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_BAD_REQUEST, $response->getStatusCode());
    }

    public function testGetGhostedLabeledThingInFrames()
    {
        $labeledThing               = $this->createLabeledThingDocument($this->task);
        $labeledThingInFrameIndex10 = $this->createLabeledInFrameDocument($labeledThing, 8);
        $labeledThingInFrameIndex11 = $this->createLabeledInFrameDocument($labeledThing, 9);

        $request = $this->createRequest(self::GHOSTS_ROUTE, [$this->task->getId(), 9, $labeledThing->getId()])
            ->setParameters(
                [
                    'offset' => -2,
                    'limit'  => 3,
                ]
            )
            ->execute();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $request->getResponse()->getStatusCode());
        $this->assertEquals(
            array(
                'result' => array(
                    array(
                        'id'             => null,
                        'rev'            => null,
                        'frameIndex'     => 7,
                        'classes'        => array(),
                        'shapes'         => array(),
                        'labeledThingId' => $labeledThingInFrameIndex10->getLabeledThingId(),
                        'incomplete'     => true,
                        'ghost'          => true,
                        'ghostClasses'   => null,
                        'identifierName' => null,
                    ),
                    array(
                        'id'             => $labeledThingInFrameIndex10->getId(),
                        'rev'            => $labeledThingInFrameIndex10->getRev(),
                        'frameIndex'     => 8,
                        'classes'        => array(),
                        'shapes'         => array(),
                        'labeledThingId' => $labeledThingInFrameIndex10->getLabeledThingId(),
                        'incomplete'     => true,
                        'ghost'          => false,
                        'ghostClasses'   => null,
                        'identifierName' => null,
                    ),
                    array(
                        'id'             => $labeledThingInFrameIndex11->getId(),
                        'rev'            => $labeledThingInFrameIndex11->getRev(),
                        'frameIndex'     => 9,
                        'classes'        => array(),
                        'shapes'         => array(),
                        'labeledThingId' => $labeledThingInFrameIndex11->getLabeledThingId(),
                        'incomplete'     => true,
                        'ghost'          => false,
                        'ghostClasses'   => null,
                        'identifierName' => null,
                    ),
                ),
            ),
            $request->getJsonResponseBody()
        );
    }

    protected function setUpImplementation()
    {
        $this->videoFacade                = $this->getAnnostationService('database.facade.video');
        $this->projectFacade              = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade         = $this->getAnnostationService('database.facade.labeling_task');
        $this->labelingThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labelingThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->labelingGroupFacade        = $this->getAnnostationService('database.facade.labelingGroup');
        $this->serializer                 = $this->getService('serializer');
        $organisationFacade        = $this->getAnnostationService('database.facade.organisation');

        $organisation = $organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));

        $user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $user->addRole(Model\User::ROLE_LABELER);

        $labelingGroup = $this->labelingGroupFacade->save(
            Model\LabelingGroup::create($organisation, [], [$user->getId()])
        );

        $this->project = Model\Project::create('test project', $organisation, $user);
        $this->project->setLabelingGroupId($labelingGroup->getId());
        $this->projectFacade->save($this->project);

        $this->video   = $this->videoFacade->save(Model\Video::create($organisation, 'foobar'));
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
            $user,
            new \DateTime
        );
        $this->task = $this->labelingTaskFacade->save($task);
    }

    private function createLabeledThingDocument(Model\LabelingTask $labelingTask)
    {
        return $this->labelingThingFacade->save(Model\LabeledThing::create($labelingTask));
    }

    private function createLabeledInFrameDocument(Model\LabeledThing $labeledThing, $frameIndex = 10)
    {
        return $this->labelingThingInFrameFacade->save(Model\LabeledThingInFrame::create($labeledThing, $frameIndex));
    }

    private function objectToArray($object)
    {
        return json_decode(
            $this->serializer->serialize(
                $object,
                'json',
                Serializer\SerializationContext::create()->setSerializeNull(true)
            ),
            true
        );
    }
}
