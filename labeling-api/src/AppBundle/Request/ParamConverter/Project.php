<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class Project extends LookupBase
{
    /**
     * @var Facade\Project
     */
    private $projectFacade;

    /**
     * @param Facade\Project $projectFacade
     */
    public function __construct(Facade\Project $projectFacade)
    {
        $this->projectFacade = $projectFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\Project::class;
    }

    protected function resolveParameter($id)
    {
        return $this->projectFacade->find($id);
    }
}
