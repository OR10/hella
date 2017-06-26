<?php
namespace AppBundle\Service\Validation;

/**
 * Class ValidationService
 *
 * @package AppBundle\Service\Validation
 */
class ValidationService
{

    /**
     * @var ValidatorRegistry
     */
    private $validatorRegistry;

    /**
     * ValidationService constructor.
     *
     * @param ValidatorRegistry $validatorRegistry
     */
    public function __construct(ValidatorRegistry $validatorRegistry)
    {
        $this->validatorRegistry = $validatorRegistry;
    }

    /**
     * @param object[] ...$objects
     *
     * @return ValidationResult
     */
    public function validate(...$objects)
    {
        $result = new ValidationResult();

        foreach ($objects as $object) {
            $validators = $this->validatorRegistry->getValidatorsForObject($object);
            foreach ($validators as $validator) {
                $result->addErrors($validator->validate($object));
            }
        }

        return $result;
    }

}
