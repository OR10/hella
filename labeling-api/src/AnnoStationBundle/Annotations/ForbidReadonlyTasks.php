<?php

namespace AnnoStationBundle\Annotations;

/**
 * @Annotation
 * @Target({"METHOD"})
 */
class ForbidReadonlyTasks
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
