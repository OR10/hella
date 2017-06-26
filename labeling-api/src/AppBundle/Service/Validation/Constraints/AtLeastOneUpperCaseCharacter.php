<?php
namespace AppBundle\Service\Validation\Constraints;

use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Constraints\RegexValidator;

/**
 * Class AtLeastOneUpperCaseCharacter
 * @package AppBundle\Service\Validation\Constraints
 */
class AtLeastOneUpperCaseCharacter extends Regex
{

    public $message = 'validator.uppercase.required';

    /**
     * AtLeastOneUpperCaseCharacter constructor.
     */
    public function __construct()
    {
        parent::__construct(["pattern" => "[\p{Lu}]"]);
    }

    public function validatedBy()
    {
        return RegexValidator::class;
    }
}
