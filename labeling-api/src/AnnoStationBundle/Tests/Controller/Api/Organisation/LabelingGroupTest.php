<?php

namespace AnnoStationBundle\Tests\Controller\Api\Organisation;

use AnnoStationBundle\Tests;
use AnnoStationBundle\Tests\Controller;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use Symfony\Component\HttpFoundation;
use FOS\UserBundle\Util;
use AnnoStationBundle\Model as AnnoStationBundleModel;

class LabelingGroupTest extends Tests\WebTestCase
{
    const ROUTE = '/api/organisation/%s/labelingGroup';

    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroupFacade;

    /**
     * @var AnnoStationBundleModel\Organisation
     */
    private $organisation;

    public function provideInvalidLabelingGroups()
    {
        return [
            'missing name'        => [
                [
                    'coordinators' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler'      => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ],
            ],
            'missing coordinator' => [
                [
                    'name'    => 'A Labeling Group',
                    'labeler' => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ],
            ],
            'missing labelers'    => [
                [
                    'name'         => 'A Labeling Group',
                    'coordinators' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                ],
            ],
            'missing everything'  => [
                [],
            ],
            'empty name'          => [
                [
                    'name'         => '',
                    'coordinators' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler'      => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ],
            ],
            'empty coordinators'  => [
                [
                    'name'         => 'A Labeling Group',
                    'coordinators' => [],
                    'labeler'      => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ],
            ],
            'empty labelers'      => [
                [
                    'name'         => 'A Labeling Group',
                    'coordinators' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler'      => [],
                ],
            ],
        ];
    }

    public function testGetLabelingGroup()
    {
        $coordinatorUser1 = $this->createUser('coordinatorUser1');
        $coordinatorUser2 = $this->createUser('coordinatorUser2');
        $labelingUser1    = $this->createUser('labelingUser1');
        $labelingUser2    = $this->createUser('labelingUser2');

        $coordinators = [$coordinatorUser1->getId(), $coordinatorUser2->getId()];
        $labeler      = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($coordinators, $labeler, 'foobar');

        $response = $this->createRequest(self::ROUTE, [$this->organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_GET)
            ->execute()
            ->getResponse();

        $content = \json_decode($response->getContent(), true);

        $this->assertSame($content['totalRows'], 1);
        $this->assertSame(
            $content['result']['labelingGroups'],
            [
                [
                    'id'             => $labelingGroup->getId(),
                    'rev'            => $labelingGroup->getRev(),
                    'coordinators'   => [
                        $coordinatorUser1->getId(),
                        $coordinatorUser2->getId(),
                    ],
                    'labeler'        => [
                        $labelingUser1->getId(),
                        $labelingUser2->getId(),
                    ],
                    'name'           => 'foobar',
                    'organisationId' => $this->organisation->getId(),
                ],
            ]
        );
    }

    public function testCreateNewLabelingGroup()
    {
        $response = $this->createRequest(self::ROUTE, [$this->organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody(
                [
                    'coordinators' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler'      => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                    'name'         => 'Some cool group',
                ]
            )
            ->execute();

        $content = \json_decode($response->getResponse()->getContent());

        $expectedLabelingGroup = $this->labelingGroupFacade->find($content->result->labelingGroups->id);

        $this->assertSame($content->result->labelingGroups->coordinators, $expectedLabelingGroup->getCoordinators());
    }

    /**
     * @dataProvider provideInvalidLabelingGroups
     */
    public function testCreateNewLabelingGroupWithMissingInformationIsRejected($data)
    {
        $response = $this->createRequest(self::ROUTE, [$this->organisation->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_POST)
            ->setJsonBody($data)
            ->execute();

        $this->assertSame(400, $response->getResponse()->getStatusCode());
    }

    public function testUpdateLabelingGroup()
    {
        $coordinatorUser1 = $this->createUser('coordinatorUser1');
        $coordinatorUser2 = $this->createUser('coordinatorUser2');
        $labelingUser1    = $this->createUser('labelingUser1');
        $labelingUser2    = $this->createUser('labelingUser2');

        $coordinators = [$coordinatorUser1->getId(), $coordinatorUser2->getId()];
        $labeler      = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($coordinators, $labeler);

        $response = $this->createRequest(self::ROUTE . '/%s', [$this->organisation->getId(), $labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'          => $labelingGroup->getRev(),
                    'coordinators' => $labelingGroup->getCoordinators(),
                    'labeler'      => $labelingGroup->getLabeler(),
                ]
            )
            ->execute();

        $content = \json_decode($response->getResponse()->getContent());

        $expectedLabelingGroup = $this->labelingGroupFacade->find($content->result->labelingGroups->id);

        $this->assertSame($content->result->labelingGroups->coordinators, $expectedLabelingGroup->getCoordinators());
    }

    public function testDeleteLabelingGroup()
    {
        $coordinatorUser1 = $this->createUser('coordinatorUser1');
        $coordinatorUser2 = $this->createUser('coordinatorUser2');
        $labelingUser1    = $this->createUser('labelingUser1');
        $labelingUser2    = $this->createUser('labelingUser2');

        $coordinators = [$coordinatorUser1->getId(), $coordinatorUser2->getId()];
        $labeler      = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($coordinators, $labeler);

        $this->createRequest(self::ROUTE . '/%s', [$this->organisation->getId(), $labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody(
                [
                    'coordinators' => $labelingGroup->getCoordinators(),
                    'labeler'      => $labelingGroup->getLabeler(),
                ]
            )
            ->execute();

        $expectedLabelingGroup = $this->labelingGroupFacade->find($labelingGroup->getId());

        $this->assertSame($expectedLabelingGroup, null);
    }

    protected function setUpImplementation()
    {
        $this->labelingGroupFacade = $this->getAnnostationService('database.facade.labeling_group');
        $organisationFacade        = $this->getAnnostationService('database.facade.organisation');
        $this->organisation        = $organisationFacade->save(Tests\Helper\OrganisationBuilder::create()->build());

        $this->createDefaultUser();
        $this->defaultUser->setRoles([Model\User::ROLE_ADMIN]);
        $this->defaultUser->assignToOrganisation($this->organisation);
    }

    /**
     * @param        $coordinators
     * @param        $labeler
     * @param string $name
     *
     * @return Model\LabelingGroup
     */
    private function createLabelingGroup($coordinators, $labeler, string $name = null)
    {
        $labelingGroup = new Model\LabelingGroup($this->organisation, $coordinators, $labeler, $name);

        return $this->labelingGroupFacade->save($labelingGroup);
    }

    /**
     * @param string $username
     *
     * @return Model\User|\FOS\UserBundle\Model\UserInterface
     */
    private function createUser(string $username)
    {
        return $this->userService->create($username, 'foo', sprintf('%s@example.com', $username), true, false);
    }
}
