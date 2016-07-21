<?php

namespace AppBundle\Tests\Controller\Api;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;

class LabelingGroupTest extends Tests\WebTestCase
{
    const ROUTE = '/api/labelingGroup';

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var Model\User
     */
    private $user;

    public function testGetLabelingGroup()
    {
        $labelingGroup = $this->createLabelingGroup();

        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_GET)
            ->execute()
            ->getResponse();


        $this->assertSame(
            \json_encode(
                [
                    'totalRows' => 1,
                    'result' => [
                        [
                            'id' => $labelingGroup->getId(),
                            'rev' => $labelingGroup->getRev(),
                            'coordinators' => $labelingGroup->getCoordinators(),
                            'labeler' => $labelingGroup->getLabeler(),
                        ]
                    ]
                ]
            ),
            $response->getContent()
        );
    }

    public function testCreateNewLabelingGroup()
    {
        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'coordinators' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler' => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ]
            )
            ->execute();

        $content = \json_decode($response->getResponse()->getContent());

        $expectedLabelingGroup = $this->labelingGroupFacade->find($content->result->id);

        $this->assertSame($content->result->coordinators, $expectedLabelingGroup->getCoordinators());
    }

    public function testUpdateLabelingGroup()
    {
        $labelingGroup = $this->createLabelingGroup();

        $response = $this->createRequest(self::ROUTE . '/%s', [$labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    '_rev' => $labelingGroup->getRev(),
                    'coordinators' => $labelingGroup->getCoordinators(),
                    'labeler' => $labelingGroup->getLabeler(),
                ]
            )
            ->execute();

        $content = \json_decode($response->getResponse()->getContent());

        $expectedLabelingGroup = $this->labelingGroupFacade->find($content->result->id);

        $this->assertSame($content->result->coordinators, $expectedLabelingGroup->getCoordinators());
    }

    public function testDeleteLabelingGroup()
    {
        $labelingGroup = $this->createLabelingGroup();

        $this->createRequest(self::ROUTE . '/%s', [$labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody(
                [
                    '_rev' => $labelingGroup->getRev(),
                    'coordinators' => $labelingGroup->getCoordinators(),
                    'labeler' => $labelingGroup->getLabeler(),
                ]
            )
            ->execute();

        $expectedLabelingGroup = $this->labelingGroupFacade->find($labelingGroup->getId());

        $this->assertSame($expectedLabelingGroup, null);
    }

    private function createLabelingGroup()
    {
        $labelingGroup = new Model\LabelingGroup(
            ['78d3f0b63202491896f992dc850f409e', '78d3f0b63202491896f992dc850f4316'],
            ['78d3f0b63202491896f992dc850f276f', '78d3f0b63202491896f992dc850f48aa']
        );
        return $this->labelingGroupFacade->save($labelingGroup);
    }

    protected function setUpImplementation()
    {
        /** @var Facade\LabelingGroup labelingGroupFacade */
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');

        $this->user = $this->getService('fos_user.util.user_manipulator')
            ->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}