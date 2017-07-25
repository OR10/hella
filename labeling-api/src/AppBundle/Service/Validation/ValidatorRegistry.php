<?php
namespace AppBundle\Service\Validation;

/**
 * Class ValidatorRegistry
 *
 * @package AppBundle\Service\Validation
 */
class ValidatorRegistry
{
    /**
     * @var Validator[]
     */
    private $validators = [];

    /**
     * @param object $object
     *
     * @return Validator
     */
    public function getValidatorsForObject($object)
    {
        $result = [];
        if ($object === null) {
            return $result;
        }

        foreach ($this->validators as $validator) {
            if ($validator->supports($object)) {
                $result[] = $validator;
            }
        }

        return $result;
    }

    /**
     * @param Validator $validator
     */
    public function addValidator(Validator $validator)
    {
        $this->validators[] = $validator;
    }
}
