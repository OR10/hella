<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AppBundle\Model;
use AnnoStationBundle\Service;
use AppBundle\Tests;
use AnnoStationBundle\Tests\Helper;
use FOS\UserBundle\Util;

class TaskIncompleteTest extends Tests\KernelTestCase
{
    /**
     * @var Service\TaskIncomplete
     */
    private $taskIncompleteService;

    /**
     * @var Factory
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Factory
     */
    private $labeledThingFacadeFactory;

    /**
     * @var Service\TaskConfigurationXmlConverterFactory
     */
    private $taskConfigurationXmlConverter;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var Service\TaskDatabaseCreator
     */
    private $taskDatabaseCreatorService;

    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacadeFactory;

    /**
     * @var Facade\LabeledThingGroupInFrame
     */
    private $labeledThingGroupInFrameFacadeFactory;

    public function testRequirementsXml()
    {
        $xml = file_get_contents(__DIR__ . '/TaskIncomplete/Requirements.xml');

        $organisation        = Helper\OrganisationBuilder::create()->build();
        $taskConfiguration = $this->taskConfigurationFacade->save(
            Helper\TaskConfigurationRequirementsBuilder::create($organisation, $xml, $this->defaultUser)->build()
        );
        $project             = $this->projectFacade->save(Helper\ProjectBuilder::create($organisation)->build());
        $video               = $this->videoFacade->save(Helper\VideoBuilder::create($organisation)->build());
        $task                = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)
                ->withTaskConfiguration($taskConfiguration)
                ->build()
        );
        $this->taskDatabaseCreatorService->createDatabase($project, $task);

        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $project->getId(),
            $task->getId()
        );
        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $project->getId(),
            $task->getId()
        );

        $labeledThing        = $labeledThingFacade->save(
            Helper\LabeledThingBuilder::create()->withTask($task)->build()
        );
        $labeledThingInFrame = $labeledThingInFrameFacade->save(
            Helper\LabeledThingInFrameBuilder::create()
                ->withLabeledThing($labeledThing)
                ->withIdentifierName('sign')
                ->build()
        );

        $this->taskIncompleteService->revalideLabeledThingInFrameIncompleteStatus($labeledThing, $labeledThingInFrame);

        $this->assertTrue($this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame));

        $labeledThingInFrame->setClasses(
            [
                'speed-sign',
                '30',
                'spain',
            ]
        );
        $labeledThingInFrameFacade->save($labeledThingInFrame);

        $this->assertFalse($this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame));
    }

    public function testRequirementsXmlGroups()
    {
        $xml = file_get_contents(__DIR__ . '/TaskIncomplete/Requirements.xml');

        $organisation        = Helper\OrganisationBuilder::create()->build();
        $taskConfiguration = $this->taskConfigurationFacade->save(
            Helper\TaskConfigurationRequirementsBuilder::create($organisation, $xml, $this->defaultUser)->build()
        );
        $project             = $this->projectFacade->save(Helper\ProjectBuilder::create($organisation)->build());
        $video               = $this->videoFacade->save(Helper\VideoBuilder::create($organisation)->build());
        $task                = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)
                ->withTaskConfiguration($taskConfiguration)
                ->build()
        );
        $this->taskDatabaseCreatorService->createDatabase($project, $task);

        $labeledThingGroupFacade = $this->labeledThingGroupFacadeFactory->getFacadeByProjectIdAndTaskId(
            $project->getId(),
            $task->getId()
        );
        $labeledThingGroupInFrameFacade = $this->labeledThingGroupInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $project->getId(),
            $task->getId()
        );

        $labeledThingGroup = $labeledThingGroupFacade->save(
            Helper\LabeledThingGroupBuilder::create($task)->withIdentifierName('lights-group')->build()
        );
        $labeledThingGroupInFrame = $labeledThingGroupInFrameFacade->save(
            Helper\LabeledThingGroupInFrameBuilder::create($task, $labeledThingGroup, 0)->build()
        );

        $this->assertTrue($this->taskIncompleteService->isLabeledThingGroupIncomplete($labeledThingGroup));
        $this->assertTrue($this->taskIncompleteService->isLabeledThingGroupInFrameIncomplete($labeledThingGroupInFrame));

        $labeledThingGroupInFrame->setClasses(['blue']);
        $labeledThingGroupInFrameFacade->save($labeledThingGroupInFrame);

        $this->assertTrue($this->taskIncompleteService->isLabeledThingGroupIncomplete($labeledThingGroup));
        $this->assertTrue($this->taskIncompleteService->isLabeledThingGroupInFrameIncomplete($labeledThingGroupInFrame));

        $labeledThingGroupInFrame->setClasses(['blue', 'big']);
        $labeledThingGroupInFrameFacade->save($labeledThingGroupInFrame);

        $this->assertFalse($this->taskIncompleteService->isLabeledThingGroupIncomplete($labeledThingGroup));
        $this->assertFalse($this->taskIncompleteService->isLabeledThingGroupInFrameIncomplete($labeledThingGroupInFrame));

        $labeledThingGroupWithEmptyClasses = $labeledThingGroupFacade->save(
            Helper\LabeledThingGroupBuilder::create($task)->withIdentifierName('empty-group')->build()
        );
        $labeledThingGroupInFrameWithEmptyClasses = $labeledThingGroupInFrameFacade->save(
            Helper\LabeledThingGroupInFrameBuilder::create($task, $labeledThingGroupWithEmptyClasses, 0)->build()
        );

        $this->assertFalse($this->taskIncompleteService->isLabeledThingGroupIncomplete($labeledThingGroupWithEmptyClasses));
        $this->assertFalse($this->taskIncompleteService->isLabeledThingGroupInFrameIncomplete($labeledThingGroupInFrameWithEmptyClasses));

    }

    public function setUpImplementation()
    {
        $this->videoFacade                           = $this->getAnnostationService('database.facade.video');
        $this->projectFacade                         = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade                    = $this->getAnnostationService('database.facade.labeling_task');
        $this->taskDatabaseCreatorService            = $this->getAnnostationService('service.task_database_creator');
        $this->labeledThingFacadeFactory             = $this->getAnnostationService(
            'database.facade.factory.labeled_thing'
        );
        $this->labeledThingInFrameFacadeFactory      = $this->getAnnostationService(
            'database.facade.factory.labeled_thing_in_frame'
        );
        $this->labeledThingGroupFacadeFactory        = $this->getAnnostationService(
            'database.facade.factory.labeled_thing_group'
        );
        $this->labeledThingGroupInFrameFacadeFactory = $this->getAnnostationService(
            'database.facade.factory.labeled_thing_group_in_frame'
        );
        $this->taskConfigurationFacade               = $this->getAnnostationService(
            'database.facade.task_configuration'
        );
        $this->taskIncompleteService                 = $this->getAnnostationService('service.task_incomplete');
        $this->taskConfigurationXmlConverter         = $this->getAnnostationService(
            'service.task_configuration_xml_converter_factory'
        );
    }
}
