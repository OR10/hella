<?php

namespace AnnoStationBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AnnoStationBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AppBundle\Request\ParamConverter;

class Organisation extends ParamConverter\LookupBase
{
    /**
     * @var Facade\Organisation
     */
    private $OrganisationFacade;

    /**
     * @param Facade\Organisation $OrganisationFacade
     */
    public function __construct(Facade\Organisation $OrganisationFacade)
    {
        $this->OrganisationFacade = $OrganisationFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\Organisation::class;
    }

    protected function resolveParameter($id)
    {
        return $this->OrganisationFacade->find($id);
    }
}
