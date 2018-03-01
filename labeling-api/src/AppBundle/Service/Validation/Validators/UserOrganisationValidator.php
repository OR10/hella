<?php

namespace AppBundle\Service\Validation\Validators;

use AnnoStationBundle\Database\Facade\Organisation as OrganisationFacade;
use AppBundle\Database\Facade\User as UserFacade;
use AppBundle\Model\User;
use AppBundle\Service\Validation\Model\VerifyUserOrganisation;
use AppBundle\Service\Validation\ValidationError;
use AppBundle\Service\Validation\Validator;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class UserOrganisationValidator
 * @package AppBundle\Service\Validation\Validators
 */
class UserOrganisationValidator implements Validator
{
    /** @var UserFacade */
    protected $userFacade;

    /**
     * @var OrganisationFacade
     */
    protected $organisationFacade;

    /**
     * @var TranslatorInterface
     */
    private $translatorInterface;

    /**
     * UserOrganisationValidator constructor.
     *
     * @param UserFacade $userFacade
     * @param OrganisationFacade $organisationFacade
     * @param TranslatorInterface $translatorInterface
     */
    public function __construct(UserFacade $userFacade, OrganisationFacade $organisationFacade,
                                TranslatorInterface $translatorInterface)
    {
        $this->userFacade = $userFacade;
        $this->organisationFacade = $organisationFacade;
        $this->translatorInterface = $translatorInterface;
    }

    /**
     * @param  VerifyUserOrganisation $object
     * @return array
     */
    public function validate($object): array
    {
        $result = [];
        $organisations = $this->organisationFacade->findByIds($object->getOrganisationIds());
        foreach ($organisations as $organisation) {
            $userLimit = $organisation->getUserQuota();
            if ($userLimit !== 0 && $userLimit <= count($this->userFacade->getUserList($organisation))) {
                $params = [
                    '%limit%' => $userLimit,
                    '%name%' => $organisation->getName()
                ];
                $result[] = new ValidationError(
                    'organisation',
                    $this->translatorInterface->trans('validator.user.organisation.quota', $params, 'validator')
                );
            }
        }

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
        return $object instanceof VerifyUserOrganisation;
    }
}