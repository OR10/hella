<?php
namespace AppBundle\Service\Validation\Validators;

use AppBundle\Service\Validation\Model\VerifyUserPassword;
use AppBundle\Service\Validation\ValidationError;
use Symfony\Component\Security\Core\Encoder\EncoderFactory;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class UserPasswordValidator
 * @package AppBundle\Service\Validation\Validators
 */
class UserPasswordValidator extends AbstractValidator
{
    /**
     * @var EncoderFactory
     */
    private $encoderFactory;
    /**
     * @var TranslatorInterface
     */
    private $translatorInterface;

    /**
     * UserPasswordValidator constructor.
     *
     * @param EncoderFactory      $encoderFactory
     * @param TranslatorInterface $translatorInterface
     */
    public function __construct(EncoderFactory $encoderFactory, TranslatorInterface $translatorInterface)
    {
        $this->encoderFactory      = $encoderFactory;
        $this->translatorInterface = $translatorInterface;
    }

    public function validate($object): array
    {
        /** @var VerifyUserPassword $object */
        $user    = $object->getUser();
        $encoder = $this->encoderFactory->getEncoder($user);

        if (!$encoder->isPasswordValid($user->getPassword(), $object->getPassword(), $user->getSalt())) {
            return [
                new ValidationError(
                    'currentPassword',
                    $this->translatorInterface->trans('validator.password.confirm.invalid', [], 'validator')
                ),
            ];
        }

        return [];
    }

    public function supports($object): bool
    {
        return $object instanceof VerifyUserPassword;
    }
}
