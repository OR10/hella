<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade\LabeledThingInFrame as LabeledThingInFrameFacadeFactory;
use AppBundle\Model;

class LabeledThingInFrame
{
    /**
     * @var LabeledThingInFrameFacadeFactory\FacadeInterface
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * LabeledThing constructor.
     *
     * @param LabeledThingInFrameFacadeFactory\FacadeInterface $labeledThingInFrameFacadeFactory
     */
    public function __construct(LabeledThingInFrameFacadeFactory\FacadeInterface $labeledThingInFrameFacadeFactory)
    {
        $this->labeledThingInFrameFacadeFactory = $labeledThingInFrameFacadeFactory;
    }

    /**
     * @param Model\LabeledThingInFrame $labeledThingInFrame
     *
     * @return Model\LabeledThingInFrame
     */
    public function save(Model\LabeledThingInFrame $labeledThingInFrame)
    {
        $labeledThingInFrameFacade = $this->labeledThingInFrameFacadeFactory->getFacadeByProjectIdAndTaskId(
            $labeledThingInFrame->getProjectId(),
            $labeledThingInFrame->getTaskId()
        );

        return $labeledThingInFrameFacade->save($labeledThingInFrame);
    }
}