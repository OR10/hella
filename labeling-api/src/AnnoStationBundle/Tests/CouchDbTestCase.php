<?php
namespace AnnoStationBundle\Tests;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AppBundle\Model\TaskConfiguration;
use AnnoStationBundle\Tests;
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
     * @var Facade\LabeledThingGroup
     */
    protected $labeledThingGroupFacade;

    /**
     * @var Facade\LabeledThingGroupInFrame
     */
    protected $labeledThingGroupInFrameFacade;

    /**
     * @var Facade\Organisation
     */
    protected $organisationFacade;

    /**
     * @var Service\TaskDatabaseCreator
     */
    protected $taskDatabaseCreatorService;

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
            false,
            $taskConfiguration === null ? null : $taskConfiguration->getId()
        );
        $task->setStatus(Model\LabelingTask::PHASE_LABELING, Model\LabelingTask::STATUS_IN_PROGRESS);
        $this->labelingTaskFacade->save($task);

        $this->taskDatabaseCreatorService->createDatabase($project, $task);

        return $task;
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
        $labeledThingInFrame->setIdentifierName('fooobar');
        $labeledThingInFrame->setCreatedAt(new \DateTime('2017-03-10 10:00:00'));
        $labeledThingInFrame->setLastModifiedAt(new \DateTime('2017-03-10 10:00:00'));

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
        $user->addRole(Model\User::ROLE_LABEL_MANAGER);

        return $user;
    }

    protected function createVideo(
        AnnoStationBundleModel\Organisation $organisation,
        $name,
        Model\CalibrationData $calibrationData = null
    ) {
        $video = Model\Video::create($organisation, $name);
        if ($calibrationData !== null) {
            $video->setCalibrationId($calibrationData->getId());
        }

        return $this->videoFacade->save($video);
    }

    protected function createCalibrationData($name, $calibration)
    {
        $calibrationData = new Model\CalibrationData($this->createOrganisation(), $name);
        $calibrationData->setCameraMatrix($calibration['cameraMatrix']);
        $calibrationData->setDistortionCoefficients($calibration['distortionCoefficients']);
        $calibrationData->setRotationMatrix($calibration['rotationMatrix']);
        $calibrationData->setTranslation($calibration['translation']);

        $this->calibrationDataFacade->save($calibrationData);

        return $calibrationData;
    }

    protected function createOrganisation($name = 'Test Organisation')
    {
        $organisation = new AnnoStationBundleModel\Organisation($name);
        $this->organisationFacade->save($organisation);

        return $organisation;
    }

    protected function createProject(
        $name,
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $user = null,
        \DateTime $dateTime = null
    ) {
        return $this->projectFacade->save(
            Model\Project::create($name, $organisation, $user, $dateTime)
        );
    }

    protected function createLabelingGroup(
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $labelManager,
        array $labelers
    ) {
        return $this->labelingGroupFacade->save(
            Model\LabelingGroup::create(
                $organisation,
                [$labelManager->getId()],
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
        AnnoStationBundleModel\Organisation $organisation,
        Model\User $user,
        $name = 'testconfig',
        $filename = 'testconfig.xml',
        $contentType = 'application/xml',
        $type = 'simpleXml'
    ) {
        $taskConfigurationXmlConverter = $this->taskConfigurationXmlConverterService->createConverter(
            $binaryData,
            Model\TaskConfiguration\SimpleXml::TYPE
        );

        switch($type) {
            case 'simpleXml':
                $configuration = new TaskConfiguration\SimpleXml(
                    $organisation,
                    $name,
                    $filename,
                    $contentType,
                    $binaryData,
                    $user->getId(),
                    $taskConfigurationXmlConverter->convertToJson()
                );
                break;
            case 'requirementsXml':
                $configuration = new TaskConfiguration\RequirementsXml(
                    $organisation,
                    $name,
                    $filename,
                    $contentType,
                    $binaryData,
                    $user->getId(),
                    $taskConfigurationXmlConverter->convertToJson()
                );
                break;
        }

        return $this->taskConfigurationFacade->save($configuration);
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
        $this->labeledThingGroupFacade              = $this->getAnnostationService(
            'database.facade.labeled_thing_group'
        );
        $this->labeledThingGroupInFrameFacade       = $this->getAnnostationService(
            'database.facade.labeled_thing_group_in_frame'
        );
        $this->organisationFacade                   = $this->getAnnostationService(
            'database.facade.organisation'
        );
        $this->taskDatabaseCreatorService           = $this->getAnnostationService('service.task_database_creator');

        $this->userManipulator = $this->getService('fos_user.util.user_manipulator');
    }
}
