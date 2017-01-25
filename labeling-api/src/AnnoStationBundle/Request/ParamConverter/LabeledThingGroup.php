<?php

namespace AnnoStationBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AppBundle\Request\ParamConverter;

class LabeledThingGroup extends ParamConverter\LookupBase
{
    /**
     * @var Facade\LabeledThingGroup
     */
    private $labeledThingGroupFacade;

    /**
     * @param Facade\LabeledThingGroup $labeledThingGroupFacade
     *
     */
    public function __construct(Facade\LabeledThingGroup $labeledThingGroupFacade)
    {
        $this->labeledThingGroupFacade = $labeledThingGroupFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\LabeledThingGroup::class;
    }

    protected function resolveParameter($id)
    {
        return $this->labeledThingGroupFacade->find($id);
    }
}
