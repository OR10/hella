<?php
namespace AppBundle\Controller\CustomException;

use Symfony\Component\HttpKernel\Exception;

class ReadOnlyHttpException extends Exception\HttpException
{
    public function __construct($message = null, \Exception $previous = null, $code = 0)
    {
        parent::__construct(403, $message, $previous, array(), $code);
    }
}
