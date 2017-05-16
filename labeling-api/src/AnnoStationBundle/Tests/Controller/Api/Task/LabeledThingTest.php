<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabeledThingTest extends Tests\WebTestCase
{
    const ROUTE = '/api/task/%s/labeledThing';

    const ITEM_ROUTE = '/api/task/%s/labeledThing/%s';

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
    private $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var Facade\Organisation
     */
    private $organisationFacade;

    public function testGetLabeledThingDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $task = $this->createLabelingTask();
        $this->createLabeledThing($task);

        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testGetNotExistingLabeledThingDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $response = $this->createRequest(self::ROUTE, ['1231239vc890xcv908'])
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testSaveLabeledThingDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $task = $this->createLabelingTask();

        $response = $this->createRequest(self::ROUTE, [$task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'id'         => '11aa239108f1419967ed8d6a1f5a765t',
                    'classes'    => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor'  => 'blue',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testSaveLabeledThingWithInvalidTaskDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $response = $this->createRequest(self::ROUTE, ['casacsgaaasfcxbx'])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'id'         => '11aa239108f1419967ed8d6a1f5a765t',
                    'classes'    => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor'  => 'blue',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_NOT_FOUND, $response->getStatusCode());
    }

    public function testUpdateLabeledThingDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $task         = $this->createLabelingTask();
        $labeledThing = $this->createLabeledThing($task);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'        => $labeledThing->getRev(),
                    'classes'    => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor'  => 'blue',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    public function testUpdateLabeledThingAndDeleteDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $task                           = $this->createLabelingTask(9, 11);
        $labeledThing                   = $this->createLabeledThing($task);
        $labeledThingInFrameBeforeRange = $this->createLabeledThingInFrame($labeledThing, 0);
        $labeledThingInFrameInRange     = $this->createLabeledThingInFrame($labeledThing, 1);
        $labeledThingInFrameAfterRange  = $this->createLabeledThingInFrame($labeledThing, 2);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'        => $labeledThing->getRev(),
                    'classes'    => array('class1' => 'test'),
                    'incomplete' => true,
                    'frameRange' => array(
                        'startFrameIndex' => 1,
                        'endFrameIndex'   => 1,
                    ),
                    'lineColor'  => 'blue',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->assertEmpty($this->labeledThingInFrameFacade->getLabeledThingInFramesOutsideRange($labeledThing));

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrameInRange, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingMovesLabeledThingInFrameToStartFrameIndexIfLabeledThingDoesNotYetExistForStartFrameIndex()
    {
        $this->skipOnPouchDbEnviroment();

        $task                = $this->createLabelingTask(9, 11);
        $labeledThing        = $this->createLabeledThing($task);
        $labeledThingInFrame = $this->createLabeledThingInFrame($labeledThing, 1);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'        => $labeledThing->getRev(),
                    'classes'    => array('class1' => 'test'),
                    'incomplete' => true,
                    'frameRange' => array(
                        'startFrameIndex' => 1,
                        'endFrameIndex'   => 1,
                    ),
                    'lineColor'  => 'blue',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->assertEmpty($this->labeledThingInFrameFacade->getLabeledThingInFramesOutsideRange($labeledThing));

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrame, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingMovesLabeledThingInFrameToEndFrameIndexIfLabeledThingDoesNotYetExistForEndFrameIndex()
    {
        $this->skipOnPouchDbEnviroment();

        $task                = $this->createLabelingTask(9, 11);
        $labeledThing        = $this->createLabeledThing($task);
        $labeledThingInFrame = $this->createLabeledThingInFrame($labeledThing, 2);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'        => $labeledThing->getRev(),
                    'classes'    => array('class1' => 'test'),
                    'incomplete' => true,
                    'frameRange' => array(
                        'startFrameIndex' => 1,
                        'endFrameIndex'   => 1,
                    ),
                    'lineColor'  => 'blue',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->assertEmpty($this->labeledThingInFrameFacade->getLabeledThingInFramesOutsideRange($labeledThing));

        $labeledThingsInFrame = $this->labeledThingFacade->getLabeledThingInFrames($labeledThing);
        $this->assertCount(1, $labeledThingsInFrame);
        $this->assertEquals($labeledThingInFrame, $labeledThingsInFrame[0]);
    }

    public function testUpdateLabeledThingWithInvalidRevDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $task         = $this->createLabelingTask();
        $labeledThing = $this->createLabeledThing($task);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'        => '324jh2jk4hkh234h',
                    'classes'    => array('class1' => 'test'),
                    'incomplete' => true,
                    'lineColor'  => 'blue',
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_CONFLICT, $response->getStatusCode());
    }

    public function testDeleteLabeledThingDocument()
    {
        $this->skipOnPouchDbEnviroment();

        $task         = $this->createLabelingTask();
        $labeledThing = $this->createLabeledThing($task);

        $this->createLabeledThingInFrame($labeledThing, 10);

        $response = $this->createRequest(self::ITEM_ROUTE, [$task->getId(), $labeledThing->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setQueryParameters(['rev' => $labeledThing->getRev()])
            ->execute()
            ->getResponse();
        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());
    }

    protected function setUpImplementation()
    {
        $this->videoFacade               = $this->getAnnostationService('database.facade.video');
        $this->projectFacade             = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade        = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade        = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->labelingGroupFacade       = $this->getAnnostationService('database.facade.labeling_group');
        $this->organisationFacade        = $this->getAnnostationService('database.facade.organisation');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
        $this->user->addRole(Model\User::ROLE_LABELER);
    }

    private function createLabelingTask($startRange = 10, $endRange = 20)
    {
        $organisation = $this->organisationFacade->save(new AnnoStationBundleModel\Organisation('Test Organisation'));
        $video = $this->videoFacade->save(Model\Video::create($organisation, 'foobar'));
        $labelingGroup = $this->labelingGroupFacade->save(
            Model\LabelingGroup::create($organisation, [], [$this->user->getId()])
        );

        $project = Model\Project::create('test project', $organisation, $this->user);
        $project->setLabelingGroupId($labelingGroup->getId());
        $this->projectFacade->save($project);

        $task  = Model\LabelingTask::create(
            $video,
            $project,
            range($startRange, $endRange),
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
                        '%s/../../../Resources/LabelStructures/%s-%s.json',
                        __DIR__,
                        Model\LabelingTask::TYPE_OBJECT_LABELING,
                        Model\LabelingTask::INSTRUCTION_PERSON
                    )
                ),
                true
            )
        );
        $task->setLabelInstruction(Model\LabelingTask::INSTRUCTION_PERSON);

        return $this->labelingTaskFacade->save($task);
    }

    private function createLabeledThing(Model\LabelingTask $task)
    {
        return $this->labeledThingFacade->save(Model\LabeledThing::create($task));
    }

    private function createLabeledThingInFrame(Model\LabeledThing $labeledThing, $frameIndex = 10)
    {
        return $this->labeledThingInFrameFacade->save(Model\LabeledThingInFrame::create($labeledThing, $frameIndex));
    }
}
