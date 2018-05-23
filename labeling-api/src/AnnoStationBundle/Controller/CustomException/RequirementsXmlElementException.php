<?php
namespace AnnoStationBundle\Controller\CustomException;

use Symfony\Component\HttpKernel\Exception;

class RequirementsXmlElementException extends Exception\HttpException
{
    /**
     * RequirementsXmlElementException constructor.
     * @param null $message
     * @param \Exception|null $previous
     * @param int $code
     */
    public function __construct($message = null, \Exception $previous = null, $code = 0)
    {
        parent::__construct(500, $message, $previous, array(), $code);
    }
}
