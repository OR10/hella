<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade\Factory;
use AppBundle\Model;

class LabeledThingInFrame
{
    /**
     * @var Factory
     */
    private $labeledThingInFrameFacadeFactory;

    /**
     * LabeledThing constructor.
     *
     * @param Factory $labeledThingInFrameFacadeFactory
     */
    public function __construct(Factory $labeledThingInFrameFacadeFactory)
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