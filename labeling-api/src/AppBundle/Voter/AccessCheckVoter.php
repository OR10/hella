<?php
namespace AppBundle\Voter;

use AppBundle\Model;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

abstract class AccessCheckVoter implements VoterInterface
{
    /**
     * Provide a full list of all accepted attributes
     *
     * @return string[]
     */
    abstract protected function getAttributes(): array;

    /**
     * Provide the type of the accepted class (object)
     *
     * @return string
     */
    abstract protected function getClass(): string;

    /**
     * Provide a list of AccessCheck implementation. The first one to return true will stop the evaluation chain.
     *
     * @return AccessCheck[]
     */
    abstract protected function getChecks(): array;

    /**
     * Checks if the voter supports the given attribute.
     *
     * @param string $attribute An attribute
     *
     * @return bool true if this Voter supports the attribute, false otherwise
     */
    public function supportsAttribute($attribute)
    {
        return in_array($attribute, $this->getAttributes());
    }

    /**
     * Checks if the voter supports the given class.
     *
     * @param string $class A class name
     *
     * @return bool true if this Voter can process the class
     */
    public function supportsClass($class)
    {
        return $class === $this->getClass();
    }

    /**
     * Check whether the current user has access to the given object
     *
     * @param TokenInterface $token A TokenInterface instance
     * @param object|null    $object The object to secure
     * @param array          $attributes An array of attributes associated with the method being invoked
     *
     * @return int either ACCESS_GRANTED, ACCESS_ABSTAIN, or ACCESS_DENIED
     */
    public function vote(TokenInterface $token, $object, array $attributes)
    {
        if (get_class($object) !== $this->getClass()) {
            throw new \RuntimeException('Received non supported object in voter: ' . $this->getClass() . ' expected');
        }

        $user = $token->getUser();

        if (!($user instanceof Model\User)) {
            // User not logged in.
            return VoterInterface::ACCESS_DENIED;
        }

        // Currently there is no authorization differentiation between read and write access
        return $this->anyCheckFulfilled(
            $this->getChecks(),
            $user,
            $object
        ) ? VoterInterface::ACCESS_GRANTED : VoterInterface::ACCESS_DENIED;
    }

    /**
     * @param AccessCheck[] $checks
     * @param Model\User           $user
     * @param object               $object
     *
     * @return bool
     */
    protected function anyCheckFulfilled(array $checks, Model\User $user, $object): bool
    {
        return array_reduce(
            $checks,
            function ($checkSuccessful, $check) use ($user, $object) {
                /**
                 * @var bool        $checkSuccessful
                 * @var AccessCheck $check
                 */
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