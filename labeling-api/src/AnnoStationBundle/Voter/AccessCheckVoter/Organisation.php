<?php
namespace AnnoStationBundle\Voter\AccessCheckVoter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Voter\AccessCheck;
use AnnoStationBundle\Voter\AccessCheckVoter;
use AppBundle\Voter;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

/**
 * Access Permission Voter for Organisations
 *
 */
class Organisation extends Voter\AccessCheckVoter
{
    const ORGANISATION_READ  = 'organisation.read';

    /**
     * @var AccessCheck[]
     */
    private $checks;

    public function __construct()
    {
        $this->checks = [
            self::ORGANISATION_READ  => [
                new AccessCheck\HasSuperAdminRole(),
                new AccessCheck\UserAssignedToOrganisation(),
            ],
        ];
    }

    /**
     * Provide a full list of all accepted attributes
     *
     * @return string[]
     */
    protected function getAttributes(): array
    {
        return [
            self::ORGANISATION_READ,
        ];
    }

    /**
     * Provide the type of the accepted class (object)
     *
     * @return string
     */
    protected function getClass(): string
    {
        return AnnoStationBundleModel\Organisation::class;
    }

    /**
     * Provide a list of AccessCheck implementation. The first one to return true will stop the evaluation chain.
     *
     * @param string $attribute
     *
     * @return \AppBundle\Voter\AccessCheck[]|array
     */
    protected function getChecks(string $attribute): array
    {
        return $this->checks[$attribute];
    }
}
