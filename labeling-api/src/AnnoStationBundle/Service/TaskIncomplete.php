<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AnnoStationBundle\Helper;

class TaskIncomplete
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfigurationFacade;

    /**
     * @var TaskConfigurationXmlConverterFactory
     */
    private $configurationXmlConverterFactory;

    /**
     * @var Factory
     */
    private $labeledThingFactory;

    /**
     * @var Factory
     */
    private $labeledThingInFrameFactory;

    /**
     * TaskIncomplete constructor.
     *
     * @param Facade\LabelingTask                  $labelingTaskFacade
     * @param Facade\TaskConfiguration             $taskConfigurationFacade
     * @param TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory
     * @param Factory                 $labeledThingFactory
     * @param Factory          $labeledThingInFrameFactory
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory,
        Factory $labeledThingFactory,
        Factory $labeledThingInFrameFactory
    ) {
        $this->labelingTaskFacade               = $labelingTaskFacade;
        $this->taskConfigurationFacade          = $taskConfigurationFacade;
        $this->configurationXmlConverterFactory = $configurationXmlConverterFactory;
        $this->labeledThingFactory              = $labeledThingFactory;
        $this->labeledThingInFrameFactory       = $labeledThingInFrameFactory;
    }

    /**
     * @param Model\LabeledThing        $labeledThing
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     */
    public function revalideLabeledThingInFrameIncompleteStatus(
        Model\LabeledThing $labeledThing,
        Model\LabeledThingInFrame $labeledThingInFrame
    ) {
        $labeledThingFacade = $this->labeledThingFactory->getFacadeByProjectIdAndTaskId(
            $labeledThing->getProjectId(),
            $labeledThing->getTaskId()
        );

        $labeledThingInFrames = $labeledThingFacade->getLabeledThingInFrames(
            $labeledThing,
            $labeledThingInFrame->getFrameIndex() + 1,
            0,
            null
        );

        usort(
            $labeledThingInFrames,
            function (Model\LabeledThingInFrame $a, Model\LabeledThingInFrame $b) {
                return $a->getFrameIndex() <=> $b->getFrameIndex();
            }
        );

        $incompleteStatus = $labeledThingInFrame->getIncomplete();

        $updatedLabeledThingInFrame = array();
        foreach ($labeledThingInFrames as $labeledThingInFrameToCheck) {
            if (!empty($labeledThingInFrameToCheck->getClasses())) {
                break;
            }
            $labeledThingInFrameToCheck->setIncomplete($incompleteStatus);
            $updatedLabeledThingInFrame[] = $labeledThingInFrameToCheck;
        }

        $labeledThingInFrameFacade = $this->labeledThingInFrameFactory->getFacadeByProjectIdAndTaskId(
            $labeledThing->getProjectId(),
            $labeledThing->getTaskId()
        );

        $labeledThingInFrameFacade->saveAll(
            $updatedLabeledThingInFrame
        );
    }

    /**
     * @param Model\LabeledThing $labeledThing
     *
     * @return bool
     */
    public function isLabeledThingIncomplete(Model\LabeledThing $labeledThing)
    {
        $labeledThingFacade   = $this->labeledThingFactory->getFacadeByProjectIdAndTaskId(
            $labeledThing->getProjectId(),
            $labeledThing->getTaskId()
        );
        $labeledThingInFrames = $labeledThingFacade->getLabeledThingInFrames($labeledThing);
        if (empty($labeledThingInFrames)) {
            return false;
        }
        foreach ($labeledThingInFrames as $labeledThingInFrame) {
            if ($this->isLabeledThingInFrameIncomplete($labeledThingInFrame)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return bool
     */
    public function isLabeledThingInFrameIncomplete(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $labeledThingFacade        = $this->labeledThingFactory->getFacadeByProjectIdAndTaskId(
            $labeledThingInFrame->getProjectId(),
            $labeledThingInFrame->getTaskId()
        );
        $labeledThingInFrameFacade = $this->labeledThingInFrameFactory->getFacadeByProjectIdAndTaskId(
            $labeledThingInFrame->getProjectId(),
            $labeledThingInFrame->getTaskId()
        );

        $labeledThing = $labeledThingFacade->find($labeledThingInFrame->getLabeledThingId());
        $task         = $this->labelingTaskFacade->find($labeledThing->getTaskId());

        $taskConfiguration = null;
        if ($task->getTaskConfigurationId() === null) {
            $helper = new Helper\IncompleteClassesChecker\Legacy($this->labelingTaskFacade->getLabelStructure($task));
        } else {
            $taskConfiguration = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());
            switch ($taskConfiguration->getType()) {
                case Model\TaskConfiguration\SimpleXml::TYPE:
                    $helper = new Helper\IncompleteClassesChecker\SimpleXml($taskConfiguration->getRawData());
                    break;
                case Model\TaskConfiguration\RequirementsXml::TYPE:
                    $helper = new Helper\IncompleteClassesChecker\RequirementsXml($taskConfiguration->getRawData());
                    break;
                default:
                    $helper = new Helper\IncompleteClassesChecker\Legacy(
                        $this->labelingTaskFacade->getLabelStructure($task)
                    );
            }
        }

        if (empty($helper->getStructure($labeledThingInFrame))) {
            return false;
        }

        if (empty($labeledThingInFrame->getClasses())) {
            $labeledThingInFrame = $labeledThingInFrameFacade->getPreviousLabeledThingInFrameWithClasses(
                $labeledThingInFrame
            );
            if ($labeledThingInFrame === null) {
                return true;
            }
        }

        foreach ($helper->getStructure($labeledThingInFrame) as $child) {
            if (!$this->searchStructureForClasses($labeledThingInFrame->getClasses(), $child)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     *
     * @return bool
     */
    public function isLabeledFrameIncomplete(Model\LabeledFrame $labeledFrame)
    {
        $classes       = $labeledFrame->getClasses();
        $task          = $this->labelingTaskFacade->find($labeledFrame->getTaskId());
        $rootStructure = $this->labelingTaskFacade->getLabelStructure($task);

        foreach ($rootStructure['children'] as $child) {
            if (!$this->searchStructureForClasses($classes, [$child])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param $classes
     * @param $structure
     *
     * @return bool
     */
    private function searchStructureForClasses($classes, $structure)
    {
        foreach ($structure as $value) {
            if (in_array($value['name'], $classes)) {
                if (isset($value['children'])) {
                    foreach ($value['children'] as $child) {
                        if ($this->searchStructureForClasses($classes, $child)) {
                            return true;
                        }
                    }

                    return false;
                } else {
                    return true;
                }
            }
        }

        return false;
    }
}
