<?php

namespace AppBundle\Annotations;

/**
 * @Annotation
 * @Target({"METHOD"})
 */
class ReadOnlyPrecondition
{
    /**
     * @var string
     */
    private $taskPropertyName = 'task';

    /**
     * @param $options
     */
    public function __construct($options)
    {
        if (isset($options['value'])) {
            $this->taskPropertyName = $options['value'];
        }
    }

    /**
     * @return string
     */
    public function getTaskPropertyName()
    {
        return $this->taskPropertyName;
    }
}
