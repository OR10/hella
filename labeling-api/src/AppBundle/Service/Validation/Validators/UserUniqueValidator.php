<?php

namespace AppBundle\Service\Validation\Validators;

use AppBundle\Database\Facade\User as UserFacade;
use AppBundle\Model\User;
use AppBundle\Service\Validation\Model\VerifyUsername;
use AppBundle\Service\Validation\ValidationError;
use AppBundle\Service\Validation\Validator;
use FOS\UserBundle\Doctrine\UserManager;
use FOS\UserBundle\Util\CanonicalizerInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Doctrine\ODM\CouchDB;

/**
 * Class UserUniqueValidator
 *
 * @package AppBundle\Service\Validation\Validators
 */
class UserUniqueValidator implements Validator
{
    /**
     * @var UserFacade
     */
    protected $userFacade;

    /**
     * @var TranslatorInterface
     */
    private $translatorInterface;

    /**
     * UserUniqueValidator constructor.
     *
     * @param UserFacade $userFacade
     * @param TranslatorInterface $translatorInterface
     */
    public function __construct(UserFacade $userFacade, TranslatorInterface $translatorInterface)
    {
        $this->userFacade = $userFacade;
        $this->translatorInterface = $translatorInterface;
    }

    /**
     * @param VerifyUsername $object
     * @return array
     */
    public function validate($object): array
    {
        if (null !== $this->userFacade->getUserByUsername($object->getUsername())) {
            return [new ValidationError(
                'username',
                $this->translatorInterface->trans('validator.username.unique.invalid', [], 'validator')
            )];
        }

        return [];
    }

    /**
     * @inheritdoc
     */
    public function supports($object): bool
    {
        return $object instanceof VerifyUsername;
    }
}