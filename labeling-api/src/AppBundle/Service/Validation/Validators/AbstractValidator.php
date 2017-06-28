<?php

namespace AppBundle\Service\Validation\Validators;

use AppBundle\Service\Validation\ValidationError;
use AppBundle\Service\Validation\Validator;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\Validation;

/**
 * Class AbstractValidator
 *
 * @package AppBundle\Service\Validation\Validators
 */
abstract class AbstractValidator implements Validator
{

    /**
     * @param string              $field
     * @param string              $value
     * @param Constraint[]        $constraints
     *
     * @param TranslatorInterface $translatorInterface
     *
     * @return array
     */
    public function validateConstraints($field, $value, array $constraints, TranslatorInterface $translatorInterface)
    {
        $result = [];

        foreach ($constraints as $constraint) {
            $errors = Validation::createValidator()->validate($value, $constraint);
            if (!empty($errors)) {
                foreach ($errors as $error) {
                    $result[] = new ValidationError($field, $translatorInterface->trans($error->getMessage(), [], 'validator'));
                }
            }
        }

        return $result;
    }
}
