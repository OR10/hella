<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade\LabeledThing as LabeledThingFacadeFactory;
use AppBundle\Model;

class LabeledThing
{
    /**
     * @var LabeledThingFacadeFactory\FacadeInterface
     */
    private $labeledThingFacadeFactory;

    /**
     * LabeledThing constructor.
     *
     * @param LabeledThingFacadeFactory\FacadeInterface $labeledThingFacadeFactory
     */
    public function __construct(LabeledThingFacadeFactory\FacadeInterface $labeledThingFacadeFactory)
    {
        $this->labeledThingFacadeFactory = $labeledThingFacadeFactory;
    }

    /**
     * @param Model\LabeledThing $labeledThing
     *
     * @return Model\LabeledThing
     */
    public function save(Model\LabeledThing $labeledThing)
    {
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labeledThing->getProjectId(),
            $labeledThing->getTaskId()
        );

        return $labeledThingFacade->save($labeledThing);
    }

    /**
     * @param Model\LabelingTask $labelingTask
     *
     * @return int
     */
    public function getMaxLabeledThingImportLineNoForTask(Model\LabelingTask $labelingTask)
    {
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        return $labeledThingFacade->getMaxLabeledThingImportLineNoForTask($labelingTask);
    }

    /**
     * @param Model\LabelingTask $labelingTask
     * @param                    $lineNo
     *
     * @return Model\LabeledThingInFrame[]
     */
    public function getLabeledThingForImportedLineNo(Model\LabelingTask $labelingTask, $lineNo)
    {
        $labeledThingFacade = $this->labeledThingFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labelingTask->getProjectId(),
            $labelingTask->getId()
        );

        return $labeledThingFacade->getLabeledThingForImportedLineNo($labelingTask, $lineNo);
    }
}
