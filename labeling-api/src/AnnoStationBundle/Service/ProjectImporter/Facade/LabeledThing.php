<?php

namespace AnnoStationBundle\Service\ProjectImporter\Facade;

use AnnoStationBundle\Database\Facade\Factory;
use AppBundle\Model;

class LabeledThing
{
    /**
     * @var Factory
     */
    private $labeledThingFacadeFactory;

    /**
     * LabeledThing constructor.
     *
     * @param Factory $labeledThingFacadeFactory
     */
    public function __construct(Factory $labeledThingFacadeFactory)
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
}