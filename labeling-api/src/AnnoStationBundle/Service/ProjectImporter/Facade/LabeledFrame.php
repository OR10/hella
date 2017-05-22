<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade\LabeledFrame as LabeledFrameFacadeFactory;
use AnnoStationBundle\Database\Facade;
use AppBundle\Model;

class LabeledFrame
{
    /**
     * @var LabeledFrameFacadeFactory\FacadeInterface
     */
    private $labeledFrameFacadeFactory;

    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * LabeledFrame constructor.
     *
     * @param Facade\LabelingTask                       $labelingTaskFacade
     * @param LabeledFrameFacadeFactory\FacadeInterface $labeledFrameFacadeFactory
     */
    public function __construct(
        Facade\LabelingTask $labelingTaskFacade,
        LabeledFrameFacadeFactory\FacadeInterface $labeledFrameFacadeFactory
    ) {
        $this->labeledFrameFacadeFactory = $labeledFrameFacadeFactory;
        $this->labelingTaskFacade        = $labelingTaskFacade;
    }

    /**
     * @param Model\LabeledFrame $labeledFrame
     *
     * @return Model\LabeledFrame
     */
    public function save(Model\LabeledFrame $labeledFrame)
    {
        $task               = $this->labelingTaskFacade->find($labeledFrame->getTaskId());
        $labeledFrameFacade = $this->labeledFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $task->getProjectId(),
            $labeledFrame->getTaskId()
        );

        return $labeledFrameFacade->save($labeledFrame);
    }
}