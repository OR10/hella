<?php
namespace AppBundle\Service\Validation\Constraints;

use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Constraints\RegexValidator;

/**
 * Class AtLeastOneSpecialCharacter
 * @package DataStationBundle\Service\Validation\Constraints
 */
class AtLeastOneSpecialCharacter extends Regex
{

    public $message = 'validator.specialchar.required';

    /**
     * AtLeastOneSpecialCharacter constructor.
     */
    public function __construct()
    {
        parent::__construct(["pattern" => "[\W]"]);
    }

    public function validatedBy()
    {
        return RegexValidator::class;
    }
}
