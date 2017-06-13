<?php

namespace AppBundle\Service\Validation\Validators;

use AppBundle\Model\User;
use DataStationBundle\Service\PasswordPolicyService;
use DataStationBundle\Service\Validation\Constraints\AtLeastOneDigit;
use DataStationBundle\Service\Validation\Constraints\AtLeastOneSpecialCharacter;
use DataStationBundle\Service\Validation\Constraints\AtLeastOneUpperCaseCharacter;
use DataStationBundle\Service\Validation\ValidationError;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class UserValidator
 *
 * @package DataStationBundle\Service\Validation\Validators
 */
class UserValidator extends AbstractValidator
{

    /**
     * @var PasswordPolicyService
     */
    private $passwordPolicyService;
    /**
     * @var TranslatorInterface
     */
    private $translatorInterface;

    /**
     * UserValidator constructor.
     *
     * @param PasswordPolicyService $passwordPolicyService
     * @param TranslatorInterface   $translatorInterface
     */
    public function __construct(PasswordPolicyService $passwordPolicyService, TranslatorInterface $translatorInterface)
    {
        $this->passwordPolicyService = $passwordPolicyService;
        $this->translatorInterface   = $translatorInterface;
    }

    /**
     * Validates the given object
     *
     * @param object $object
     *
     * @return ValidationError[]
     */
    public function validate($object): array
    {
        $result = [];
        /* @var User $object */
        if ($object->getPlainPassword() !== null) {
            $passwordConstraints = $this->passwordPolicyService->getConstraints();

            $result = array_merge(
                $result,
                $this->validateConstraints(
                    'password',
                    $object->getPlainPassword(),
                    $passwordConstraints,
                    $this->translatorInterface
                )
            );
        }

        $result = array_merge(
            $result,
            $this->validateConstraints(
                'email',
                $object->getEmail(),
                [
                    new Assert\NotBlank(),
                    new Assert\Email(),
                ],
                $this->translatorInterface
            )
        );

        return $result;
    }

    /**
     * Returns whether this validator supports the given object.
     *
     * @param object $object
     *
     * @return bool
     */
    public function supports($object): bool
    {
        return $object instanceof User;
    }
}
