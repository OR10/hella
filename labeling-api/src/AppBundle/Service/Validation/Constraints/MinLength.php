<?php
namespace AppBundle\Service\Validation\Constraints;

use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\NotBlankValidator;
use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Constraints\RegexValidator;

/**
 * Class AtLeastOneUpperCaseCharacter
 * @package AppBundle\Service\Validation\Constraints
 */
class MinLength extends NotBlank
{

    public $message = 'validator.minlength.required';

    public function validatedBy()
    {
        return NotBlankValidator::class;
    }
}
