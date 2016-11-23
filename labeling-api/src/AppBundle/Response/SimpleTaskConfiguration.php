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
            $prefix = '';
            if ($taskConfiguration instanceof Model\TaskConfiguration\SimpleXml) {
                $prefix = 'SimpleXml';
            }
            if ($taskConfiguration instanceof Model\TaskConfiguration\RequirementsXml) {
                $prefix = 'RequirementsXml';
            }
            return [
                'id' => $taskConfiguration->getId(),
                'name' => sprintf('%s (%s)', $taskConfiguration->getName(), $prefix),
            ];
        }, $taskConfigurations);
    }
}
