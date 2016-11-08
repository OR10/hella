<?php
namespace AppBundle\Voter;

use AppBundle\Model;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

abstract class AbstractVoter implements VoterInterface
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
     * @return bool
     */
    public abstract function voteOnAttribute(TokenInterface $token, $object, array $attributes);

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
        // Unfortunately the interface enforces the support methods, but does not use them to check if a vote is
        // applicable or not. Therefore this is done here manually
        if ($object === null || !$this->supportsClass(get_class($object))) {
            return VoterInterface::ACCESS_ABSTAIN;
        }

        $anyAttributeSupported = array_reduce(
            $attributes,
            function ($supported, $attribute) {
                if ($supported === true) {
                    return $supported;
                } else {
                    return $this->supportsAttribute($attribute);
                }
            },
            false
        );

        if ($anyAttributeSupported === false) {
            return VoterInterface::ACCESS_ABSTAIN;
        }

        $user = $token->getUser();

        if (!($user instanceof Model\User)) {
            // User not logged in.
            return VoterInterface::ACCESS_DENIED;
        }

        if ($this->voteOnAttribute($token, $object, $attributes) === true) {
            return VoterInterface::ACCESS_GRANTED;
        } else {
            return VoterInterface::ACCESS_DENIED;
        }
    }
}
