<?php

namespace AnnoStationBundle\Service;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Database\Facade\Factory;
use AnnoStationBundle\Service;
use AppBundle\Model;
use AppBundle\Service as AppBundleService;

class LabeledFrameEndCalculationService
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @var Factory\LabeledFrame
     */
    private $labeledFrameFacadeFactory;

    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        Factory\LabeledFrame $labeledFrameFacadeFactory
    ) {
        $this->labelingTaskFacade        = $labelingTaskFacade;
        $this->labeledFrameFacadeFactory = $labeledFrameFacadeFactory;
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     * @param                    $class
     *
     * @return mixed
     */
    public function getEndOfForClassOfLabeledFrame(Model\LabeledFrame $labeledFrame, $class)
    {
        $task = $this->labelingTaskFacade->find($labeledFrame->getTaskId());

        return $this->findEnd($task, $labeledFrame->getFrameIndex(), $class);
    }

    /**
     * @param Model\LabelingTask $task
     * @param                    $index
     * @param                    $class
     *
     * @return mixed
     */
    private function findEnd(Model\LabelingTask $task, $index, $class)
    {
        $labeledFrameFacade = $this->labeledFrameFacadeFactory->getProjectAndTaskFacade(
            $task->getProjectId(),
            $task->getId()
        );

        $nextLabeledFrame = $labeledFrameFacade->getNextLabeledFrameFromFrameIndex(
            $task,
            $index
        );

        if ($nextLabeledFrame === null) {
            return max($task->getFrameNumberMapping());
        }

        if (in_array($class, $nextLabeledFrame->getClasses())) {
            return $this->findEnd($task, $nextLabeledFrame->getFrameIndex(), $class);
        }

        return $nextLabeledFrame->getFrameIndex() - 1;
    }
}