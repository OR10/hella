<?php

namespace AnnoStationBundle\Service\ProjectDeleter\Delete;

use AppBundle\Model;
use AnnoStationBundle\Database\Facade\LabelingTask;
use AnnoStationBundle\Database\Facade\LabeledFrame;

class LabeledFrames
{
    /**
     * @var LabelingTask\FacadeInterface
     */
    private $labelingTaskFacadeFactory;

    /**
     * @var LabeledFrame\FacadeInterface
     */
    private $labeledFrameFacadeFactory;

    public function __construct(
        LabelingTask\FacadeInterface $labelingTaskFacadeFactory,
        LabeledFrame\FacadeInterface $labeledFrameFacadeFactory
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
