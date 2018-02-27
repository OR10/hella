<?php

namespace AnnoStationBundle\Service\v1\Project;

use AppBundle\Exception;
use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AppBundle\Database\Facade as AppFacade;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProjectService
{

    private  $taskConfigurationFacade;

    public function __construct( Facade\TaskConfiguration $taskConfigurationFacade)
    {
        $this->taskConfigurationFacade               = $taskConfigurationFacade;
    }

    /**
     * Create new Project
     * @param $organisation
     * @param $user
     * @param $request
     * @return static
     */
    public function createNewProject($organisation, $user, $request)
    {
        $name             = $request->request->get('name');
        $review           = $request->request->get('review');
        $frameSkip        = $request->request->get('frameSkip');
        $startFrameNumber = $request->request->get('startFrameNumber');
        $splitEach        = $request->request->get('splitEach');
        $description      = $request->request->get('description');
        $projectType      = $request->request->get('projectType');
        $campaigns        = $request->request->get('campaigns', []);
        $dueDate          = $request->request->get('dueDate');

        $campaigns = array_filter($campaigns);

        $labelingValidationProcesses = [];
        if ($review) {
            $labelingValidationProcesses[] = 'review';
        }

        try {
            $project = Model\Project::create(
                $name,
                $organisation,
                $user,
                null,
                $dueDate === null ? null : new \DateTime($dueDate, new \DateTimeZone('UTC')),
                $labelingValidationProcesses,
                $frameSkip,
                $startFrameNumber,
                $splitEach,
                $description,
                $campaigns
            );

            $project->setAvailableExports([$projectType]);
        } catch (\InvalidArgumentException $exception) {

            throw new BadRequestHttpException($exception->getMessage(), $exception);
        }

        switch ($projectType) {
            case 'legacy':
                if ($request->request->get('vehicle', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_VEHICLE,
                        $request->request->get('drawingToolVehicle', 'rectangle')
                    );
                }
                if ($request->request->get('person', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_PERSON,
                        $request->request->get('drawingToolPerson', 'pedestrian')
                    );
                }
                if ($request->request->get('cyclist', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_CYCLIST,
                        $request->request->get('drawingToolCyclist', 'rectangle')
                    );
                }
                if ($request->request->get('ignore', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_IGNORE,
                        $request->request->get('drawingToolIgnore', 'rectangle')
                    );
                }
                if ($request->request->get('ignore-vehicle', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_IGNORE_VEHICLE,
                        $request->request->get('drawingToolIgnoreVehicle', 'rectangle')
                    );
                }
                if ($request->request->get('lane', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_LANE,
                        $request->request->get('drawingToolLane', 'rectangle')
                    );
                }
                if ($request->request->get('parked-cars', false)) {
                    $project->addLegacyTaskInstruction(
                        Model\LabelingTask::INSTRUCTION_PARKED_CARS,
                        $request->request->get('drawingToolParkedCars', 'cuboid')
                    );
                }
                break;
            case 'genericXml':
                $taskTypeConfigurations = $request->request->get('taskTypeConfigurations');

                if (empty($taskTypeConfigurations)) {
                    throw new BadRequestHttpException('Missing task type configuration');
                }

                foreach ($taskTypeConfigurations as $taskTypeConfiguration) {
                    $project->addGenericXmlTaskInstruction(
                        $taskTypeConfiguration['type'],
                        $taskTypeConfiguration['taskConfigurationId']
                    );
                }
                break;
            case 'requirementsXml':
                $taskTypeConfigurations = $request->request->get('taskTypeConfigurations');

                if (empty($taskTypeConfigurations)) {
                    throw new BadRequestHttpException('Missing task type configuration');
                }

                if (count($taskTypeConfigurations) > 1) {
                    throw new BadRequestHttpException(
                        'Only a single requirementsXML is allowed for a project.'
                    );
                }

                $taskTypeConfiguration = reset($taskTypeConfigurations);

                if ($taskTypeConfiguration['taskConfigurationId'] === '' || $taskTypeConfiguration['type'] === '') {
                    throw new BadRequestHttpException('Invalid taskConfigurationId or taskType');
                }

                $taskConfiguration = $this->taskConfigurationFacade->find(
                    $taskTypeConfiguration['taskConfigurationId']
                );
                if ($taskConfiguration === null) {
                    throw new BadRequestHttpException('Task configuration not found.');
                }

                $project->addRequirementsXmlTaskInstruction(
                    $taskTypeConfiguration['type'],
                    $taskTypeConfiguration['taskConfigurationId']
                );
                break;
        }

        return $project;
    }
}
