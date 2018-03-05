<?php

namespace AppBundle\Service\Validation\Validators;

use AnnoStationBundle\Model\Organisation;
use AppBundle\Model\User;
use AppBundle\Service\PasswordPolicyService;
use AppBundle\Service\Validation\Constraints\AtLeastOneDigit;
use AppBundle\Service\Validation\Constraints\AtLeastOneSpecialCharacter;
use AppBundle\Service\Validation\Constraints\AtLeastOneUpperCaseCharacter;
use AppBundle\Service\Validation\ValidationError;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Class UserValidator
 *
 * @package AppBundle\Service\Validation\Validators
 */
class OrganisationValidator extends AbstractValidator
{


    /**
     * @var TranslatorInterface
     */
    private $translatorInterface;

    /**
     * UserValidator constructor.
     *
     * @param TranslatorInterface   $translatorInterface
     */
    public function __construct(TranslatorInterface $translatorInterface)
    {
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
        $result =
            $this->validateConstraints(
                'userQuota',
                $object->getUserQuota(),
                [
                    new Assert\NotBlank(),
                    new Assert\Regex(['pattern' => '/^[0-9]\d*$/',
                    'message' => 'Please use only positive numbers.'])
                ],
                $this->translatorInterface
            );

        $result = array_merge(
            $result,
            $this->validateConstraints(
                'name',
                $object->getName(),
                [
                    new Assert\NotBlank(),
                    new Assert\Length(
                        [
                            "min" => 2,
                            "max" => 100,
                            "minMessage" => "Minimum length 2",
                            "maxMessage" => "Maximum length 100"
                        ]
                    )
                ],
                $this->translatorInterface
            )
        );

        $result = array_merge(
            $result,
            $this->validateConstraints(
                'quota',
                $object->getQuota(),
                [
                    new Assert\NotBlank(),
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
        return $object instanceof Organisation;
    }
}
