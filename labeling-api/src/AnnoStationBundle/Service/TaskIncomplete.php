<?php

namespace AnnoStationBundle\Service;

use AppBundle\Model;
use AnnoStationBundle\Model as AnnoStationBundleModel;
use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\LabeledThing;
use AnnoStationBundle\Database\Facade\LabeledThingInFrame;
use AnnoStationBundle\Database\Facade\LabeledThingGroup;
use AnnoStationBundle\Database\Facade\LabeledThingGroupInFrame;
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
     * @var LabeledThing\FacadeInterface
     */
    private $labeledThingFactory;

    /**
     * @var LabeledThingInFrame\FacadeInterface
     */
    private $labeledThingInFrameFactory;

    /**
     * @var LabeledThingGroup\FacadeInterface
     */
    private $labeledThingGroupFactory;

    /**
     * @var LabeledThingGroupInFrame\FacadeInterface
     */
    private $labeledThingGroupInFrameFactory;

    /**
     * TaskIncomplete constructor.
     *
     * @param Facade\LabelingTask                      $labelingTaskFacade
     * @param Facade\TaskConfiguration                 $taskConfigurationFacade
     * @param TaskConfigurationXmlConverterFactory     $configurationXmlConverterFactory
     * @param LabeledThing\FacadeInterface             $labeledThingFactory
     * @param LabeledThingInFrame\FacadeInterface      $labeledThingInFrameFactory
     * @param LabeledThingGroup\FacadeInterface        $labeledThingGroupFactory
     * @param LabeledThingGroupInFrame\FacadeInterface $labeledThingGroupInFrameFactory
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Facade\TaskConfiguration $taskConfigurationFacade,
        Service\TaskConfigurationXmlConverterFactory $configurationXmlConverterFactory,
        LabeledThing\FacadeInterface $labeledThingFactory,
        LabeledThingInFrame\FacadeInterface $labeledThingInFrameFactory,
        LabeledThingGroup\FacadeInterface $labeledThingGroupFactory,
        LabeledThingGroupInFrame\FacadeInterface $labeledThingGroupInFrameFactory
    ) {
        $this->labelingTaskFacade               = $labelingTaskFacade;
        $this->taskConfigurationFacade          = $taskConfigurationFacade;
        $this->configurationXmlConverterFactory = $configurationXmlConverterFactory;
        $this->labeledThingFactory              = $labeledThingFactory;
        $this->labeledThingInFrameFactory       = $labeledThingInFrameFactory;
        $this->labeledThingGroupFactory         = $labeledThingGroupFactory;
        $this->labeledThingGroupInFrameFactory  = $labeledThingGroupInFrameFactory;
    }

    /**
     * @param Model\LabeledThing        $labeledThing
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     */
    public function revalideLabeledThingInFrameIncompleteStatus(
        Model\LabeledThing $labeledThing,
        Model\LabeledThingInFrame $labeledThingInFrame
    ) {
        $labeledThingFacade = $this->getFacadeByProjectAndTaskId($this->labeledThingFactory, $labeledThing);

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

        $labeledThingInFrameFacade = $this->getFacadeByProjectAndTaskId(
            $this->labeledThingInFrameFactory,
            $labeledThing
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
        $labeledThingFacade   = $this->getFacadeByProjectAndTaskId($this->labeledThingFactory, $labeledThing);
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
        $labeledThingFacade        = $this->getFacadeByProjectAndTaskId(
            $this->labeledThingFactory,
            $labeledThingInFrame
        );
        $labeledThingInFrameFacade = $this->getFacadeByProjectAndTaskId(
            $this->labeledThingInFrameFactory,
            $labeledThingInFrame
        );

        $labeledThing = $labeledThingFacade->find($labeledThingInFrame->getLabeledThingId());
        $task         = $this->labelingTaskFacade->find($labeledThing->getTaskId());
        $helper       = $this->getHelper($task);

        if (empty($helper->getLabeledThingInFrameStructure($labeledThingInFrame))) {
            return false;
        }

        $prediction = $helper->getThingPrediction($labeledThingInFrame->getIdentifierName());
        if (empty($labeledThingInFrame->getClasses())) {
            switch ($prediction) {
                case 'all':
                    $labeledThingInFrameToTheRight = $labeledThingInFrameFacade->getNextLabeledThingInFrameWithClasses(
                        $labeledThingInFrame,
                        $task
                    );
                    $labeledThingInFrameToTheLeft  = $labeledThingInFrameFacade->getPreviousLabeledThingInFrameWithClasses(
                        $labeledThingInFrame
                    );
                    if ($labeledThingInFrameToTheRight instanceof Model\LabeledThingInFrame) {
                        $labeledThingInFrame = $labeledThingInFrameToTheLeft;
                    }
                    if ($labeledThingInFrameToTheLeft instanceof Model\LabeledThingInFrame) {
                        $labeledThingInFrame = $labeledThingInFrameToTheLeft;
                    }
                    break;
                default:
                    $labeledThingInFrame = $labeledThingInFrameFacade->getPreviousLabeledThingInFrameWithClasses(
                        $labeledThingInFrame
                    );
            }
        }

        if ($labeledThingInFrame === null) {
            return true;
        }

        foreach ($helper->getLabeledThingInFrameStructure($labeledThingInFrame) as $child) {
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
        $classes = $labeledFrame->getClasses();
        $task    = $this->labelingTaskFacade->find($labeledFrame->getTaskId());

        $taskConfiguration     = $this->taskConfigurationFacade->find($task->getTaskConfigurationId());
        $helper                = new Helper\IncompleteClassesChecker\RequirementsXml($taskConfiguration->getRawData());
        $labeledFrameStructure = $helper->getLabeledFrameStructure();


        if (empty($labeledFrameStructure)) {
            return false;
        }

        foreach ($labeledFrameStructure as $child) {
            if (!$this->searchStructureForClasses($classes, $child)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param AnnoStationBundleModel\LabeledThingGroup $labeledThingGroup
     *
     * @return bool
     */
    public function isLabeledThingGroupIncomplete(AnnoStationBundleModel\LabeledThingGroup $labeledThingGroup)
    {
        $task   = $this->labelingTaskFacade->find($labeledThingGroup->getTaskId());
        $helper = $this->getHelper($task);

        if (empty($helper->getLabeledThingGroupStructure($labeledThingGroup))) {
            return false;
        }

        $labeledThingGroupInFrameFacade = $this->getFacadeByProjectAndTaskId(
            $this->labeledThingGroupInFrameFactory,
            $labeledThingGroup
        );

        $labeledThingGroupInFrames = $labeledThingGroupInFrameFacade->getLabeledThingGroupInFramesForLabeledThingGroup($labeledThingGroup);

        foreach($labeledThingGroupInFrames as $labeledThingGroupInFrame) {
            if ($this->isLabeledThingGroupInFrameIncomplete($labeledThingGroupInFrame)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param AnnoStationBundleModel\LabeledThingGroupInFrame $labeledThingGroupInFrame
     *
     * @return bool
     */
    public function isLabeledThingGroupInFrameIncomplete(
        AnnoStationBundleModel\LabeledThingGroupInFrame $labeledThingGroupInFrame
    ) {
        $labeledThingGroupFacade        = $this->getFacadeByProjectAndTaskId(
            $this->labeledThingGroupFactory,
            $labeledThingGroupInFrame
        );
        $labeledThingGroupInFrameFacade = $this->getFacadeByProjectAndTaskId(
            $this->labeledThingGroupInFrameFactory,
            $labeledThingGroupInFrame
        );

        $labeledThingGroup = $labeledThingGroupFacade->find(
            $labeledThingGroupInFrame->getLabeledThingGroupId()
        );
        $task              = $this->labelingTaskFacade->find($labeledThingGroupInFrame->getTaskId());
        $helper            = $this->getHelper($task);

        if (empty($helper->getLabeledThingGroupStructure($labeledThingGroup))) {
            return false;
        }

        if (empty($labeledThingGroupInFrame->getClasses())) {
            $labeledThingGroupInFrame = $labeledThingGroupInFrameFacade->getPreviousLabeledThingInFrameWithClasses(
                $labeledThingGroupInFrame
            );
            if ($labeledThingGroupInFrame === null) {
                return true;
            }
        }

        $labeledThingGroup = $labeledThingGroupInFrameFacade->find(
            $labeledThingGroupInFrame->getLabeledThingGroupId()
        );
        foreach ($helper->getLabeledThingGroupStructure($labeledThingGroup) as $child) {
            if (!$this->searchStructureForClasses($labeledThingGroupInFrame->getClasses(), $child)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param Model\LabelingTask $task
     *
     * @return Helper\IncompleteClassesChecker\Legacy|Helper\IncompleteClassesChecker\RequirementsXml|Helper\IncompleteClassesChecker\SimpleXml
     */
    private function getHelper(Model\LabelingTask $task)
    {
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

        return $helper;
    }

    /**
     * @param Facade\LabeledThing\FacadeInterface|Facade\LabeledThingInFrame\FacadeInterface|Facade\LabeledThingGroup\FacadeInterface|Facade\LabeledThingGroupInFrame\FacadeInterface $factory
     * @param Model\LabeledThing|Model\LabeledThingInFrame|AnnoStationBundleModel\LabeledThingGroup|AnnoStationBundleModel\LabeledThingGroupInFrame                                                                     $model
     *
     * @return Facade\LabeledThing|Facade\LabeledThingInFrame|Facade\LabeledThingGroup|Facade\LabeledThingGroupInFrame
     */
    private function getFacadeByProjectAndTaskId($factory, $model)
    {
        return $factory->getFacadeByProjectIdAndTaskId(
            $model->getProjectId(),
            $model->getTaskId()
        );
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
