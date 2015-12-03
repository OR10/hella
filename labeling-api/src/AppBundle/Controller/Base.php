<?php
namespace AppBundle\Controller;

use AppBundle\Annotations\CloseSession;
use AppBundle\Model;
use Symfony\Component\HttpFoundation\Session;

abstract class Base
{
    /**
     * @param mixed                 $input
     * @param Model\FrameRange|null $defaultIfNull
     *
     * @return Model\FrameRange|null
     */
    protected function createFrameRange($input, Model\FrameRange $defaultIfNull = null)
    {
        if ($input === null) {
            return $defaultIfNull;
        }

        if (!is_array($input)) {
            return null;
        }

        try {
            return Model\FrameRange::createFromArray($input);
        } catch (\Exception $e) {
            return null;
        }
    }
}
