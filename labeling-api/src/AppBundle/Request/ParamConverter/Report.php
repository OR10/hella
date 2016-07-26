<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class Report extends LookupBase
{
    /**
     * @var Facade\Report
     */
    private $reportFacade;

    /**
     * @param Facade\Report $reportFacade
     */
    public function __construct(Facade\Report $reportFacade)
    {
        $this->reportFacade = $reportFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\Report::class;
    }

    protected function resolveParameter($id)
    {
        return $this->reportFacade->find($id);
    }
}
