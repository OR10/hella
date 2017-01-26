<?php

namespace AnnoStationBundle\Tests\Controller\Api\Task;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AnnoStationBundle\Model;
use AppBundle\Model as AppBundleModel;
use AnnoStationBundle\Database\Facade;
use Doctrine\ODM\CouchDB;
use JMS\Serializer;
use Symfony\Component\HttpFoundation;

class LabeledThingGroupTest extends Tests\CouchDbTestCase
{
    /**
     * @var AppBundleModel\LabelingTask
     */
    private $task;

    public function testCreateLabeledThingGroup()
    {
        $this->createLabeledThing($this->task);
        $groupType = 'LabeledThingGroupId';
        $groupIds  = ['bedcb1138b5ca91103f453823e2b7a3f', 'a322d8abcdd59a7eb3c5aa7ca3080f34'];

        $response = $this->createRequest('/api/task/%s/labeledThingGroup', [$this->task->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'groupType' => $groupType,
                    'groupIds'  => $groupIds,
                ]
            )
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $response = \json_decode($response->getContent(), true);

        $this->assertEquals($groupType, $response['result']['groupType']);
        $this->assertEquals($groupIds, $response['result']['groupIds']);
    }

    public function testDeleteLabeledThingGroup()
    {
        $this->createLabeledThing($this->task);
        $labeledThingGroup = new Model\LabeledThingGroup('LabeledThingGroupId', 22);
        $this->labeledThingGroupFacade->save($labeledThingGroup);

        $response = $this->createRequest(
            '/api/task/%s/labeledThingGroup/%s',
            [$this->task->getId(), $labeledThingGroup->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->execute()
            ->getResponse();

        $this->assertEquals(HttpFoundation\Response::HTTP_OK, $response->getStatusCode());

        $this->assertNull($this->labeledThingGroupFacade->find($labeledThingGroup->getId()));
    }

    public function testGetLabeledThingGroupInFrame()
    {
        $labeledThing = $this->createLabeledThing($this->task);

        $labeledThingGroup1 = new Model\LabeledThingGroup('LabeledThingGroupId-1', 22);
        $this->labeledThingGroupFacade->save($labeledThingGroup1);
        $labeledThingGroup2 = new Model\LabeledThingGroup('LabeledThingGroupId-2', 22);
        $this->labeledThingGroupFacade->save($labeledThingGroup2);

        $labeledThing->setGroupIds([$labeledThingGroup1->getId(), $labeledThingGroup2->getId()]);
        $this->labeledThingFacade->save($labeledThing);

        $response = $this->createRequest(
            '/api/task/%s/labeledThingGroupInFrame/frame/22',
            [$this->task->getId()]
        )
            ->setMethod(HttpFoundation\Request::METHOD_GET)
            ->execute()
            ->getResponse();

        $response = \json_decode($response->getContent(), true);
        $this->assertEquals(
            [
                [
                    'id'         => '11111111-0000-0000-0000-111111111111',
                    'rev'        => null,
                    'classes'    => [],
                    'frameIndex' => '22',
                ],
                [
                    'id'         => '11111111-0000-0000-0000-111111111111',
                    'rev'        => null,
                    'classes'    => [],
                    'frameIndex' => '22',
                ],
            ],
            $response['result']
        );
    }

    protected function setUpImplementation()
    {
        parent::setUpImplementation();
        $project    = $this->createProject('LabeledThingGroupTest');
        $video      = $this->createVideo('video-1');
        $this->task = $this->createTask($project, $video);
        $this->createDefaultUser();
    }
}
