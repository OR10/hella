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
    const ROUTE = '/api/v1/organisation/%s/labelingGroup';

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
                    'labelManager' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler'      => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ],
            ],
            'missing labelManagers' => [
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
                    'labelManager' => [
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
                    'labelManager' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler'      => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ],
            ],
            'empty labelManager'  => [
                [
                    'name'         => 'A Labeling Group',
                    'labelManager' => [],
                    'labeler'      => [
                        'fc687f8423e6d27e616925eb3bae8e57',
                    ],
                ],
            ],
            'empty labelers'      => [
                [
                    'name'         => 'A Labeling Group',
                    'labelManager' => [
                        '4b1ae8ac5323af2673b73dbfcf5aa6de',
                    ],
                    'labeler'      => [],
                ],
            ],
        ];
    }

    public function testGetLabelingGroup()
    {
        $labelManagerUser1 = $this->createUser('labelManagerUser1');
        $labelManagerUser2 = $this->createUser('labelManagerUser2');
        $labelingUser1    = $this->createUser('labelingUser1');
        $labelingUser2    = $this->createUser('labelingUser2');

        $labelManagers = [$labelManagerUser1->getId(), $labelManagerUser2->getId()];
        $labeler      = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($labelManagers, $labeler, 'foobar');

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
                    'coordinators'    => [],
                    'labelManagers'   => [
                        $labelManagerUser1->getId(),
                        $labelManagerUser2->getId(),
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
                    'labelManagers' => [
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

        $this->assertSame($content->result->labelingGroups->labelManagers, $expectedLabelingGroup->getLabelManagers());
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
        $labelManagerUser1 = $this->createUser('labelManagerUser1');
        $labelManagerUser2 = $this->createUser('labelManagerUser2');
        $labelingUser1    = $this->createUser('labelingUser1');
        $labelingUser2    = $this->createUser('labelingUser2');

        $labelManagers = [$labelManagerUser1->getId(), $labelManagerUser2->getId()];
        $labeler       = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($labelManagers, $labeler);

        $response = $this->createRequest(self::ROUTE . '/%s', [$this->organisation->getId(), $labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_PUT)
            ->setJsonBody(
                [
                    'rev'           => $labelingGroup->getRev(),
                    'labelManagers' => $labelingGroup->getLabelManagers(),
                    'labeler'       => $labelingGroup->getLabeler(),
                ]
            )
            ->execute();

        $content = \json_decode($response->getResponse()->getContent());

        $expectedLabelingGroup = $this->labelingGroupFacade->find($content->result->labelingGroups->id);

        $this->assertSame($content->result->labelingGroups->labelManagers, $expectedLabelingGroup->getLabelManagers());
    }

    public function testDeleteLabelingGroup()
    {
        $labelManagerUser1 = $this->createUser('labelManagerUser1');
        $labelManagerUser2 = $this->createUser('labelManagerUser2');
        $labelingUser1    = $this->createUser('labelingUser1');
        $labelingUser2    = $this->createUser('labelingUser2');

        $labelManagers = [$labelManagerUser1->getId(), $labelManagerUser2->getId()];
        $labeler       = [$labelingUser1->getId(), $labelingUser2->getId()];

        $labelingGroup = $this->createLabelingGroup($labelManagers, $labeler);

        $this->createRequest(self::ROUTE . '/%s', [$this->organisation->getId(), $labelingGroup->getId()])
            ->setMethod(HttpFoundation\Request::METHOD_DELETE)
            ->setJsonBody(
                [
                    'labelManagers' => $labelingGroup->getLabelManagers(),
                    'labeler'       => $labelingGroup->getLabeler(),
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
        $this->defaultUser->setRoles([Model\User::ROLE_LABEL_MANAGER]);
        $this->defaultUser->assignToOrganisation($this->organisation);
    }

    /**
     * @param        $labelManagers
     * @param        $labeler
     * @param string $name
     *
     * @return Model\LabelingGroup
     */
    private function createLabelingGroup($labelManagers, $labeler, string $name = null)
    {
        $labelingGroup = new Model\LabelingGroup($this->organisation, $labelManagers, $labeler, $name);

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
