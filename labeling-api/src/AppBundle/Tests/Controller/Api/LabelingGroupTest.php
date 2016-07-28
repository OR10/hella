<?php

namespace AppBundle\Tests\Controller\Api;

use AppBundle\Tests;
use AppBundle\Tests\Controller;
use AppBundle\Model;
use AppBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;

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

    /**
     * @var Util\UserManipulator
     */
    private $userService;

    public function testGetLabelingGroup()
    {
        /** @var Model\User $coordinatorUser1 */
        $coordinatorUser1 = $this->userService->create('coordinatorUser1', 'foo', 'coordinatorUser1@foo.de', true, false);
        /** @var Model\User $coordinatorUser2 */
        $coordinatorUser2 = $this->userService->create('coordinatorUser2', 'foo', 'coordinatorUser2@foo.de', true, false);
        /** @var Model\User $labelingUser1 */
        $labelingUser1    = $this->userService->create('labelingUser1', 'foo', 'labelingUser1@foo.de', true, false);
        /** @var Model\User $labelingUser2 */
        $labelingUser2    = $this->userService->create('labelingUser2', 'foo', 'labelingUser2@foo.de', true, false);

        $coordinators = [$coordinatorUser1->getId(), $coordinatorUser2->getId()];
        $labeler      = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($coordinators, $labeler);

        $response = $this->createRequest(self::ROUTE)
            ->setMethod(HttpFoundation\Request::METHOD_GET)
            ->execute()
            ->getResponse();

        $content = \json_decode($response->getContent(), true);

        $this->assertSame($content['totalRows'], 1);
        $this->assertSame($content['result']['labelingGroups'], [
            [
                'id' => $labelingGroup->getId(),
                'rev' => $labelingGroup->getRev(),
                'coordinators' => [
                    $coordinatorUser1->getId(),
                    $coordinatorUser2->getId(),
                ],
                'labeler' => [
                    $labelingUser1->getId(),
                    $labelingUser2->getId(),
                ],
            ]
        ]);
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

        $expectedLabelingGroup = $this->labelingGroupFacade->find($content->result->labelingGroups->id);

        $this->assertSame($content->result->labelingGroups->coordinators, $expectedLabelingGroup->getCoordinators());
    }

    public function testUpdateLabelingGroup()
    {
        /** @var Model\User $coordinatorUser1 */
        $coordinatorUser1 = $this->userService->create('coordinatorUser1', 'foo', 'coordinatorUser1@foo.de', true, false);
        /** @var Model\User $coordinatorUser2 */
        $coordinatorUser2 = $this->userService->create('coordinatorUser2', 'foo', 'coordinatorUser2@foo.de', true, false);
        /** @var Model\User $labelingUser1 */
        $labelingUser1    = $this->userService->create('labelingUser1', 'foo', 'labelingUser1@foo.de', true, false);
        /** @var Model\User $labelingUser2 */
        $labelingUser2    = $this->userService->create('labelingUser2', 'foo', 'labelingUser2@foo.de', true, false);

        $coordinators = [$coordinatorUser1->getId(), $coordinatorUser2->getId()];
        $labeler      = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($coordinators, $labeler);

        $response = $this->createRequest(self::ROUTE . '/%s', [$labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev' => $labelingGroup->getRev(),
                    'coordinators' => $labelingGroup->getCoordinators(),
                    'labeler' => $labelingGroup->getLabeler(),
                ]
            )
            ->execute();

        $content = \json_decode($response->getResponse()->getContent());

        $expectedLabelingGroup = $this->labelingGroupFacade->find($content->result->labelingGroups->id);

        $this->assertSame($content->result->labelingGroups->coordinators, $expectedLabelingGroup->getCoordinators());
    }

    public function testDeleteLabelingGroup()
    {
        /** @var Model\User $coordinatorUser1 */
        $coordinatorUser1 = $this->userService->create('coordinatorUser1', 'foo', 'coordinatorUser1@foo.de', true, false);
        /** @var Model\User $coordinatorUser2 */
        $coordinatorUser2 = $this->userService->create('coordinatorUser2', 'foo', 'coordinatorUser2@foo.de', true, false);
        /** @var Model\User $labelingUser1 */
        $labelingUser1    = $this->userService->create('labelingUser1', 'foo', 'labelingUser1@foo.de', true, false);
        /** @var Model\User $labelingUser2 */
        $labelingUser2    = $this->userService->create('labelingUser2', 'foo', 'labelingUser2@foo.de', true, false);

        $coordinators = [$coordinatorUser1->getId(), $coordinatorUser2->getId()];
        $labeler      = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($coordinators, $labeler);

        $this->createRequest(self::ROUTE . '/%s', [$labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody(
                [
                    'coordinators' => $labelingGroup->getCoordinators(),
                    'labeler' => $labelingGroup->getLabeler(),
                ]
            )
            ->execute();

        $expectedLabelingGroup = $this->labelingGroupFacade->find($labelingGroup->getId());

        $this->assertSame($expectedLabelingGroup, null);
    }

    private function createLabelingGroup($coordinators, $labeler)
    {
        $labelingGroup = new Model\LabelingGroup($coordinators, $labeler);
        return $this->labelingGroupFacade->save($labelingGroup);
    }

    protected function setUpImplementation()
    {
        /** @var Facade\LabelingGroup labelingGroupFacade */
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');

        /** @var Util\UserManipulator userService */
        $this->userService = $this->getService('fos_user.util.user_manipulator');

        $this->user = $this->userService->create(self::USERNAME, self::PASSWORD, self::EMAIL, true, false);
    }
}