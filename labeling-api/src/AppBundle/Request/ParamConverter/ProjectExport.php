<?php

namespace AppBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class ProjectExport extends LookupBase
{
    /**
     * @var Facade\Project
     */
    private $projectExportFacade;

    /**
     * @param Facade\ProjectExport $projectExportFacade
     */
    public function __construct(Facade\ProjectExport $projectExportFacade)
    {
        $this->projectExportFacade = $projectExportFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\ProjectExport::class;
    }

    protected function resolveParameter($id)
    {
        return $this->projectExportFacade->find($id);
    }
}
