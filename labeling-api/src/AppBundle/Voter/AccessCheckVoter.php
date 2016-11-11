<?php
namespace AppBundle\Voter;

use AppBundle\Model;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

abstract class AccessCheckVoter extends AbstractVoter
{
    /**
     * Provide a list of AccessCheck implementation for a given attribute.
     * The first one to return true will stop the evaluation chain.
     *
     * @param string $attribute
     *
     * @return AccessCheck[]|array
     */
    abstract protected function getChecks(string $attribute): array;

    /**
     * Execute certain checks/votes, which need to be done before the defined AccessChecks are executed
     * if this method returns false the vote will be denied
     *
     * @param TokenInterface $token
     * @param object| null   $object
     * @param array          $attributes
     *
     * @return bool
     */
    protected function arePreconditionsMet(TokenInterface $token, $object, array $attributes): bool
    {
        return true;
    }

    /**
     * Check whether the current user has access to the given object
     *
     * @param TokenInterface $token A TokenInterface instance
     * @param object|null    $object The object to secure
     * @param array          $attributes An array of attributes associated with the method being invoked
     *
     * @return bool
     */
    public function voteOnAttribute(TokenInterface $token, $object, array $attributes)
    {
        if ($this->arePreconditionsMet($token, $object, $attributes) !== true) {
            return false;
        }

        foreach ($attributes as $attribute) {
            $decision = $this->anyCheckFulfilled(
                $this->getChecks($attribute),
                $token->getUser(),
                $object
            );

            // All attributes must check out in order to allow access
            if ($decision === false) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param AccessCheck[] $checks
     * @param Model\User    $user
     * @param object        $object
     *
     * @return bool
     */
    protected function anyCheckFulfilled(array $checks, Model\User $user, $object): bool
    {
        return array_reduce(
            $checks,
            function (bool $checkSuccessful, AccessCheck $check) use ($user, $object) {
                if ($checkSuccessful) {
                    return $checkSuccessful;
                } else {
                    return $check->userHasAccessToObject($user, $object);
                }
            },
            false
        );
    }
}
