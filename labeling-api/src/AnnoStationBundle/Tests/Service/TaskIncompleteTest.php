<?php

namespace AnnoStationBundle\Tests\Service;

use AnnoStationBundle\Database\Facade;
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
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

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
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @var Service\TaskConfigurationXmlConverterFactory
     */
    private $taskConfigurationXmlConverter;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    public function testSimpleXml()
    {
        $xml = file_get_contents(__DIR__ . '/TaskIncomplete/Simple.xml');

        $labelStructure = $this->taskConfigurationXmlConverter->createConverter(
            $xml,
            Model\TaskConfiguration\SimpleXml::TYPE
        );

        $project             = $this->projectFacade->save(Helper\ProjectBuilder::create()->build());
        $video               = $this->videoFacade->save(Helper\VideoBuilder::create()->build());
        $task                = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)
                ->withLabelStructure($labelStructure->getLabelStructure())
                ->build()
        );
        $labeledThing        = $this->labeledThingFacade->save(
            Helper\LabeledThingBuilder::create()->withTask($task)->build()
        );
        $labeledThingInFrame = $this->labeledThingInFrameFacade->save(
            Helper\LabeledThingInFrameBuilder::create()
                ->withLabeledThing($labeledThing)
                ->build()
        );

        $this->taskIncompleteService->revalideLabeledThingInFrameIncompleteStatus($labeledThing, $labeledThingInFrame);

        $this->assertTrue($this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame));

        $labeledThingInFrame->setClasses(
            [
                'occlusion-0',
                'truncation-1',
                'direction-back-left',
            ]
        );
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        $this->assertFalse($this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame));
    }

    public function testRequirementsXml()
    {
        $xml = file_get_contents(__DIR__ . '/TaskIncomplete/Requirements.xml');

        $taskConfiguration = $this->taskConfigurationFacade->save(
            Helper\TaskConfigurationRequirementsBuilder::create($xml, $this->defaultUser)->build()
        );

        $project             = $this->projectFacade->save(Helper\ProjectBuilder::create()->build());
        $video               = $this->videoFacade->save(Helper\VideoBuilder::create()->build());
        $task                = $this->labelingTaskFacade->save(
            Helper\LabelingTaskBuilder::create($project, $video)
                ->withTaskConfiguration($taskConfiguration)
                ->build()
        );
        $labeledThing        = $this->labeledThingFacade->save(
            Helper\LabeledThingBuilder::create()->withTask($task)->build()
        );
        $labeledThingInFrame = $this->labeledThingInFrameFacade->save(
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
        $this->labeledThingInFrameFacade->save($labeledThingInFrame);

        $this->assertFalse($this->taskIncompleteService->isLabeledThingInFrameIncomplete($labeledThingInFrame));
    }

    public function setUpImplementation()
    {
        $this->videoFacade                   = $this->getAnnostationService('database.facade.video');
        $this->projectFacade                 = $this->getAnnostationService('database.facade.project');
        $this->labelingTaskFacade            = $this->getAnnostationService('database.facade.labeling_task');
        $this->labeledThingFacade            = $this->getAnnostationService('database.facade.labeled_thing');
        $this->labeledThingInFrameFacade     = $this->getAnnostationService('database.facade.labeled_thing_in_frame');
        $this->taskConfigurationFacade       = $this->getAnnostationService('database.facade.task_configuration');
        $this->taskIncompleteService         = $this->getAnnostationService('service.task_incomplete');
        $this->taskConfigurationXmlConverter = $this->getAnnostationService(
            'service.task_configuration_xml_converter_factory'
        );
    }
}
