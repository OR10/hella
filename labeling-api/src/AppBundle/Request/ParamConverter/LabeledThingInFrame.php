<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class LabeledThingInFrame extends LookupBase
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrameFacade)
    {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\LabeledThingInFrame::class;
    }

    protected function resolveParameter($id)
    {
        return $this->labeledThingInFrameFacade->find($id);
    }
}
