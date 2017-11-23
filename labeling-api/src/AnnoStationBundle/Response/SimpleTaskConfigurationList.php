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
     * @param                           $projects
     */
    public function __construct(
        $taskConfigurations,
        $projects
    ) {
        $this->result = array_map(
            function (Model\TaskConfiguration $taskConfiguration) use ($projects) {
                $project = array_map(
                    function (Model\Project $project) {
                        return ['id' => $project->getId(), 'name' => $project->getName()];
                    },
                    $projects[$taskConfiguration->getId()]
                );

                return [
                    'id'          => $taskConfiguration->getId(),
                    'name'        => $taskConfiguration->getName(),
                    'filename'    => $taskConfiguration->getFilename(),
                    'projects'    => $project,
                    'isDeletable' => count($project) === 0,
                ];
            },
            $taskConfigurations
        );
    }
}
