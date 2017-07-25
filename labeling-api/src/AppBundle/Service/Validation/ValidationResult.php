<?php
namespace AppBundle\Service\Validation;

use AppBundle\View;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class ValidationResult
 *
 * @package AppBundle\Service\Validation
 */
class ValidationResult
{
    /**
     * @var ValidationError[]
     */
    private $errors = [];

    /**
     * @param ValidationError[] $errors
     */
    public function addErrors(array $errors)
    {
        $this->errors = array_merge($this->errors, $errors);
    }

    /**
     * @return ValidationError[]
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * @return bool
     */
    public function hasErrors()
    {
        return !empty($this->errors);
    }

    /**
     * @return View\View
     */
    public function createView()
    {
        return new View\View(
            [
                "error" => $this->errors,
            ],
            Response::HTTP_BAD_REQUEST
        );
    }
}
