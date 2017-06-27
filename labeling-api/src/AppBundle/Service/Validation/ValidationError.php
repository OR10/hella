<?php

namespace AppBundle\Service\Validation;

/**
 * Class ValidationError
 *
 * @package AppBundle\Service\Validation
 */
class ValidationError
{
    /**
     * @var string
     */
    private $field;

    /**
     * @var string
     */
    private $message;

    /**
     * ValidationError constructor.
     *
     * @param string $field
     * @param string $message
     */
    public function __construct(string $field, string $message)
    {
        $this->field   = $field;
        $this->message = $message;
    }

    /**
     * @return string
     */
    public function getField()
    {
        return $this->field;
    }

    /**
     * @return string
     */
    public function getMessage()
    {
        return $this->message;
    }
}
