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
                    'lineColor' => 1,
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
        $labeledThingGroup = new Model\LabeledThingGroup('LabeledThingGroupId', 22, 1);
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

        $labeledThingGroup1 = new Model\LabeledThingGroup(
            1,
            'LabeledThingGroupId-1',
            ['7920ae3e-2547-46de-9ed0-682724144394']
        );
        $this->labeledThingGroupFacade->save($labeledThingGroup1);
        $labeledThingGroup2 = new Model\LabeledThingGroup(
            1,
            'LabeledThingGroupId-2',
            ['bdbec977-58a2-499f-a8b1-b724d8b9834e']
        );
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

        $labeledThingGroupsInFrames = array_map(
            function ($labeledThingGroupsInFrame) {
                unset($labeledThingGroupsInFrame['id']);

                return $labeledThingGroupsInFrame;
            },
            $response['result']['labeledThingGroupsInFrame']
        );
        $labeledThingGroups         = array_map(
            function ($labeledThingGroup) {
                unset($labeledThingGroup['rev']);

                return $labeledThingGroup;
            },
            $response['result']['labeledThingGroups']
        );
        
        $this->assertEquals(
            [
                'labeledThingGroupsInFrame' => [
                    [
                        'rev'                 => null,
                        'labeledThingGroupId' => $labeledThingGroup2->getId(),
                        'classes'             => [],
                        'frameIndex'          => '22',
                    ],
                    [
                        'rev'        => null,
                        'labeledThingGroupId' => $labeledThingGroup1->getId(),
                        'classes'    => [],
                        'frameIndex' => '22',
                    ],
                ],
                'labeledThingGroups'        => [
                    [
                        'id'        => $labeledThingGroup2->getId(),
                        'lineColor' => 1,
                        'groupType' => 'LabeledThingGroupId-2',
                        'groupIds'  => ['bdbec977-58a2-499f-a8b1-b724d8b9834e'],
                    ],
                    [
                        'id'        => $labeledThingGroup1->getId(),
                        'lineColor' => 1,
                        'groupType' => 'LabeledThingGroupId-1',
                        'groupIds'  => ['7920ae3e-2547-46de-9ed0-682724144394'],
                    ],
                ],
            ],
            [
                'labeledThingGroupsInFrame' => $labeledThingGroupsInFrames,
                'labeledThingGroups'        => $labeledThingGroups,
            ]
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
