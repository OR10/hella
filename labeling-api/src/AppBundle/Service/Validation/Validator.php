<?php
namespace AppBundle\Service\Validation;

/**
 * Class Validator
 *
 * @package AppBundle\Service\Validation
 */
interface Validator
{

    /**
     * Validates the given object
     *
     * @param object $object
     *
     * @return ValidationError[]
     */
    public function validate($object): array;

    /**
     * Returns whether this validator supports the given object.
     *
     * @param object $object
     *
     * @return bool
     */
    public function supports($object): bool;
}
