<?php

namespace AnnoStationBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AppBundle\Request\ParamConverter;

class LabeledThing extends ParamConverter\LookupBase
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @param Facade\LabeledThing $labeledThingFacade
     */
    public function __construct(Facade\LabeledThing $labeledThingFacade)
    {
        $this->labeledThingFacade = $labeledThingFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\LabeledThing::class;
    }

    protected function resolveParameter($id)
    {
        return $this->labeledThingFacade->find($id);
    }
}
