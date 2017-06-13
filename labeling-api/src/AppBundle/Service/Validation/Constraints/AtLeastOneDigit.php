<?php
namespace AppBundle\Service\Validation\Constraints;

use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Constraints\RegexValidator;

/**
 * Class AtLeastOneDigit
 *
 * @package DataStationBundle\Service\Validation\Constraints
 */
class AtLeastOneDigit extends Regex
{

    public $message = "validator.digit.required";

    /**
     * AtLeastOneDigit constructor.
     */
    public function __construct()
    {
        parent::__construct(["pattern" => "[\d]"]);
    }

    public function validatedBy()
    {
        return RegexValidator::class;
    }
}
