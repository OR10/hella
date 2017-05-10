<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\Factory;

class LabeledFrames
{

    /**
     * @var Factory\LabelingTask
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var Factory\LabeledFrame
     */
    private $labeledFrameFacadeFactory;

    public function __construct(
        Factory\LabelingTask $labelingTaskFacadeFactory,
        Factory\LabeledFrame $labeledFrameFacadeFactory
    ) {
        $this->labelingTaskFacadeFactory = $labelingTaskFacadeFactory;
        $this->labeledFrameFacadeFactory = $labeledFrameFacadeFactory;
    }

    /**
     * @param Model\LabelingTask $labelingTask
     */
    public function delete(Model\LabelingTask $labelingTask)
    {
        $labelingTaskFacade = $this->labelingTaskFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );
        $labeledFrameFacade = $this->labeledFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        $labeledFrames = $labelingTaskFacade->getLabeledFrames($labelingTask);
        foreach ($labeledFrames as $labeledFrame) {
            $labeledFrameFacade->delete($labeledFrame);
        }
    }
}
