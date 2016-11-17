<?php
namespace AppBundle\Tests;

use AppBundle\Database\Facade;
use AppBundle\Service;
use AppBundle\Model;
use AppBundle\Tests;
use FOS\UserBundle\Util\UserManipulator;

class CouchDbTestCase extends Tests\WebTestCase
{
    /**
     * @var Facade\Video
     */
    protected $videoFacade;

    /**
     * @var Facade\CalibrationData
     */
    protected $calibrationDataFacade;

    /**
     * @var Facade\LabelingTask
     */
    protected $labelingTaskFacade;

    /**
     * @var Facade\Project
     */
    protected $projectFacade;

    /**
     * @var Facade\LabeledThing
     */
    protected $labeledThingFacade;

    /**
     * @var Facade\LabeledThingInFrame
     */
    protected $labeledThingInFrameFacade;

    /**
     * @var Facade\LabelingGroup
     */
    protected $labelingGroupFacade;

    /**
     * @var UserManipulator
     */
    protected $userManipulator;

    /**
     * @var Facade\LabeledFrame
     */
    protected $labeledFrameFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Service\TaskConfigurationXmlConverterFactory
     */
    private $taskConfigurationXmlConverterService;

    /**
     * @param Model\Project           $project
     * @param Model\Video             $video
     * @param Model\TaskConfiguration $taskConfiguration
     * @param null                    $drawingTool
     * @param string                  $taskType
     *
     * @return Model\LabelingTask
     */
    protected function createTask(
        Model\Project $project,
        Model\Video $video,
        Model\TaskConfiguration $taskConfiguration = null,
        $drawingTool = null,
        $taskType = Model\LabelingTask::TYPE_OBJECT_LABELING
    ) {
        $task = Model\LabelingTask::create(
            $video,
            $project,
            range(1, 100),
            $taskType,
            $drawingTool,
            [],
            [],
            null,
            false,
            $taskConfiguration === null ? null : $taskConfiguration->getId()
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);

        return $this->labelingTaskFacade->save($task);
    }

    protected function createLabeledThing(Model\LabelingTask $task, $id = null)
    {
        $labeledThing = Model\LabeledThing::create($task);

        if ($id !== null) {
            $labeledThing->setId($id);
        }

        return $this->labeledThingFacade->save($labeledThing);
    }

    protected function createLabeledThingInFrame(
        Model\LabeledThing $labeledThing,
        $frameIndex,
        $shapes = [],
        $classes = [],
        $id = null
    ) {
        $labeledThingInFrame = Model\LabeledThingInFrame::create(
            $labeledThing,
            $frameIndex,
            $classes,
            $shapes
        );

        if ($id !== null) {
            $labeledThingInFrame->setId($id);
        }

        return $this->labeledThingInFrameFacade->save($labeledThingInFrame);
    }

    protected function createUser($username = self::USERNAME, $password = self::PASSWORD, $email = self::EMAIL)
    {
        $user = $this->userManipulator->create(
            $username,
            $password,
            $email,
            true,
            false
        );
        $user->addRole(Model\User::ROLE_ADMIN);

        return $user;
    }

    protected function createVideo($name, Model\CalibrationData $calibrationData = null)
    {
        $video = Model\Video::create($name);
        if ($calibrationData !== null) {
            $video->setCalibrationId($calibrationData->getId());
        }

        return $this->videoFacade->save($video);
    }

    protected function createCalibrationData($name, $calibration)
    {
        $calibrationData = new Model\CalibrationData($name);
        $calibrationData->setCameraMatrix($calibration['cameraMatrix']);
        $calibrationData->setDistortionCoefficients($calibration['distortionCoefficients']);
        $calibrationData->setRotationMatrix($calibration['rotationMatrix']);
        $calibrationData->setTranslation($calibration['translation']);

        $this->calibrationDataFacade->save($calibrationData);

        return $calibrationData;
    }

    protected function createProject($name)
    {
        return $this->projectFacade->save(
            Model\Project::create($name)
        );
    }

    protected function createLabelingGroup(Model\User $coordinator, array $labelers)
    {
        return $this->labelingGroupFacade->save(
            Model\LabelingGroup::create(
                [$coordinator->getId()],
                array_map(
                    function ($labeler) {
                        /** @var Model\User $labeler */
                        return $labeler->getId();
                    },
                    $labelers
                )
            )
        );
    }

    protected function createLabeledFrame(Model\LabelingTask $task, $frameIndex, $id = null, $classes = [])
    {
        $labeledFrame = Model\LabeledFrame::create(
            $task,
            $frameIndex
        );

        if ($id !== null) {
            $labeledFrame->setId($id);
        }

        if (!empty($classes)) {
            $labeledFrame->setClasses($classes);
        }

        return $this->labeledFrameFacade->save($labeledFrame);
    }

    protected function createTaskConfiguration(
        $binaryData,
        Model\User $user,
        $name = 'testconfig',
        $filename = 'testconfig.xml',
        $contentType = 'application/xml'
    ) {
        $taskConfigurationXmlConverter = $this->taskConfigurationXmlConverterService->createConverter($binaryData);

        return $this->taskConfigurationFacade->save(
            new Model\TaskConfiguration(
                $name,
                $filename,
                $contentType,
                $binaryData,
                $user->getId(),
                $taskConfigurationXmlConverter->convertToJson()
            )
        );
    }

    protected function setUpImplementation()
    {
        $this->videoFacade                          = $this->getAnnostationService('database.facade.video');
        $this->calibrationDataFacade                = $this->getAnnostationService('database.facade.calibration_data');
        $this->projectFacade                        = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade                   = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade                   = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade            = $this->getAnnostationService(
            'database.facade.labeled_thing_in_frame'
        );
        $this->labeledFrameFacade                   = $this->getAnnostationService('database.facade.labeled_frame');
        $this->labelingGroupFacade                  = $this->getAnnostationService('database.facade.labeling_group');
        $this->taskConfigurationFacade              = $this->getAnnostationService(
            'database.facade.task_configuration'
        );
        $this->taskConfigurationXmlConverterService = $this->getAnnostationService(
            'service.task_configuration_xml_converter_factory'
        );

        $this->userManipulator = $this->getService('fos_user.util.user_manipulator');
    }
}
