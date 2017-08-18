<?php
namespace AnnoStationBundle\Tests\Voter;

use AppBundle\Model;
use AnnoStationBundle\Tests;
use AppBundle\Voter;
use FOS\UserBundle\Util\UserManipulator;
use PHPUnit_Framework_MockObject_MockObject;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class AccessCheckVoterTest extends Tests\CouchDbTestCase
{
    /**
     * @var Voter\AccessCheckVoter
     */
    private $voter;

    /**
     * @var TokenInterface
     */
    private $token;

    /**
     * @var Model\User
     */
    private $user;

    /**
     * @var Model\Project
     */
    private $project;

    /**
     * @var Voter\AccessCheck
     */
    private $check;

    protected function setUpImplementation()
    {
        parent::setUpImplementation();

        $this->check = $this->getMockForAbstractClass(Voter\AccessCheck::class);
        $this->check->method('userHasAccessToObject')->willReturn(true);

        $this->voter = $this->getMockForAbstractClass(
            Voter\AccessCheckVoter::class,
            [],
            '',
            true,
            true,
            true,
            ['arePreconditionsMet']
        );
        $this->voter->method('getClass')->willReturn(\stdClass::class);
        $this->voter->method('getAttributes')->willReturn(['some.attribute']);
        $this->voter->method('getChecks')->willReturn([$this->check]);

        $this->user = $this->createUser();
        $this->user->removeRole(Model\User::ROLE_LABEL_MANAGER);

        $this->token = $this->getMockBuilder(TokenInterface::class)->getMock();
        $this->token->method('getUser')->willReturn($this->user);
    }

    public function testChecksAreBeingRequested()
    {
        $voter = $this->voter;
        /** @var PHPUnit_Framework_MockObject_MockObject $voter */

        $voter->method('arePreconditionsMet')->willReturn(true);

        $voter
            ->expects($this->once())
            ->method('getChecks')
            ->with(
                $this->equalTo('some.attribute')
            );

        $this->assertTrue(
            $voter->voteOnAttribute($this->token, new \stdClass(), ['some.attribute'])
        );
    }

    public function testChecksAreBeingExecuted()
    {
        $voter = $this->voter;
        /** @var PHPUnit_Framework_MockObject_MockObject $voter */
        $check = $this->check;
        /** @var PHPUnit_Framework_MockObject_MockObject $check */

        $object = new \stdClass();

        $voter->method('arePreconditionsMet')->willReturn(true);

        $check
            ->expects($this->once())
            ->method('userHasAccessToObject')
            ->with(
                $this->equalTo($this->user),
                $this->equalTo($object)
            );

        $this->assertTrue(
            $voter->voteOnAttribute($this->token, $object, ['some.attribute'])
        );
    }

    public function testPreconditionsAreChecked()
    {
        $voter = $this->voter;
        /** @var PHPUnit_Framework_MockObject_MockObject $voter */

        $object = new \stdClass();

        $voter->method('arePreconditionsMet')->willReturn(false);

        $voter
            ->expects($this->once())
            ->method('arePreconditionsMet')
            ->with(
                $this->equalTo($this->token),
                $this->equalTo($object),
                $this->equalTo(['some.attribute'])
            );

        $this->assertFalse(
            $voter->voteOnAttribute($this->token, $object, ['some.attribute'])
        );
    }
}
