<?php

namespace AppBundle\Response;

use AppBundle\Model;

class SimpleTaskConfiguration
{
    /**
     * @var Model\TaskConfiguration[]
     */
    private $result = [];

    /**
     * @param Model\TaskConfiguration $taskConfiguration
     */
    public function __construct(Model\TaskConfiguration $taskConfiguration)
    {
        $this->result = [
            'id'       => $taskConfiguration->getId(),
            'name'     => $taskConfiguration->getName(),
            'filename' => $taskConfiguration->getFilename(),
            'userId'   => $taskConfiguration->getUserId(),
            'type'     => $taskConfiguration->getType(),
        ];
    }
}
