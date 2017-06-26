<?php
namespace AppBundle\Service;

use AppBundle\Service\Validation\Constraints\AtLeastOneDigit;
use AppBundle\Service\Validation\Constraints\AtLeastOneSpecialCharacter;
use AppBundle\Service\Validation\Constraints\AtLeastOneUpperCaseCharacter;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\Constraints\Length;

/**
 * Class PasswordPolicyService
 * @package AppBundle\Service
 */
class PasswordPolicyService
{
    /**
     * @var string[]
     */
    private $config;

    /**
     * PasswordPolicyService constructor.
     *
     * @param string[] $config
     */
    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * @return Constraint[]
     */
    public function getConstraints()
    {
        $constraints = [];
        foreach ($this->config as $constraint => $config) {
            switch ($constraint) {
                case "AtLeastOneSpecialCharacter":
                    $constraints[] = new AtLeastOneSpecialCharacter();
                    break;
                case "AtLeastOneDigit":
                    $constraints[] = new AtLeastOneDigit();
                    break;
                case "Length":
                    $constraints[] = new Length($config);
                    break;
                case "AtLeastOneUpperCaseCharacter":
                    $constraints[] = new AtLeastOneUpperCaseCharacter();
                    break;
            }
        }

        return $constraints;
    }
}
