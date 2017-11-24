<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;

class Project
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @param Facade\Project           $projectFacade
     * @param Facade\TaskConfiguration $taskConfigurationFacade
     */
    public function __construct(
        Facade\Project $projectFacade,
        Facade\TaskConfiguration $taskConfigurationFacade
    ) {

        $this->projectFacade = $projectFacade;
        $this->taskConfigurationFacade = $taskConfigurationFacade;
    }

    /**
     * @param Model\Project $project
     */
    public function delete(Model\Project $project)
    {
        $requirementsXmlTaskInstructions = $project->getRequirementsXmlTaskInstructions();
        $this->projectFacade->delete($project);

        foreach ($requirementsXmlTaskInstructions as $requirementsXmlTaskInstruction) {
            $taskConfiguration = $this->taskConfigurationFacade->find(
                $requirementsXmlTaskInstruction['taskConfigurationId']
            );
            $this->deleteConfiguration($taskConfiguration);

            if (isset($requirementsXmlTaskInstruction['previousConfigurationId'])) {
                $previousTaskConfiguration = $this->taskConfigurationFacade->find(
                    $requirementsXmlTaskInstruction['previousConfigurationId']
                );
                $this->deleteConfiguration($previousTaskConfiguration);
            }
        }
    }

    /**
     * @param Model\TaskConfiguration $taskConfiguration
     */
    private function deleteConfiguration(Model\TaskConfiguration $taskConfiguration)
    {
        if (!$taskConfiguration->isDeleted()) {
            return;
        }

        $taskConfigurationProjects = $this->projectFacade->getProjectsByTaskConfiguration($taskConfiguration);

        $taskConfigurationReferences = $this->taskConfigurationFacade->getPreviousTaskConfigurations(
            $taskConfiguration
        );

        if (count($taskConfigurationProjects) === 0 && count($taskConfigurationReferences) === 0) {
            $this->taskConfigurationFacade->delete($taskConfiguration);
        }
    }
}
