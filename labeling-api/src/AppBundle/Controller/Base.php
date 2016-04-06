<?php
namespace AppBundle\Controller;

use AppBundle\Annotations\CloseSession;
use AppBundle\Model;
use Symfony\Component\HttpFoundation\Session;

abstract class Base
{
    /**
     * @param mixed                 $input
     * @param Model\FrameIndexRange|null $defaultIfNull
     *
     * @return Model\FrameIndexRange|null
     */
    protected function createFrameRange($input, Model\FrameIndexRange $defaultIfNull = null)
    {
        if ($input === null) {
            return $defaultIfNull;
        }

        if (!is_array($input)) {
            return null;
        }

        try {
            return Model\FrameIndexRange::createFromArray($input);
        } catch (\Exception $e) {
            return null;
        }
    }
}
