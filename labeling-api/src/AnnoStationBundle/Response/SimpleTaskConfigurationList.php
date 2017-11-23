<?php

namespace AnnoStationBundle\Response;

use AppBundle\Model;

class SimpleTaskConfigurationList
{
    /**
     * @var Model\TaskConfiguration[]
     */
    private $result = [];

    /**
     * @param Model\TaskConfiguration[] $taskConfigurations
     */
    public function __construct(
        $taskConfigurations
    ) {
        $this->result = array_map(
            function (Model\TaskConfiguration $taskConfiguration) {
                return [
                    'id'       => $taskConfiguration->getId(),
                    'name'     => $taskConfiguration->getName(),
                    'filename' => $taskConfiguration->getFilename(),
                ];
            },
            $taskConfigurations
        );
    }
}
