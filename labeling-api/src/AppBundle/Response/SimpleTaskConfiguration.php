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
     * @param Model\TaskConfiguration $taskConfigurations[]
     */
    public function __construct(
        $taskConfigurations
    ) {
        $this->result = array_map(function(Model\TaskConfiguration $taskConfiguration) {
            return [
                'id' => $taskConfiguration->getId(),
                'name' => $taskConfiguration->getName(),
            ];
        }, $taskConfigurations);
    }
}