<?php

namespace AnnoStationBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AppBundle\Request\ParamConverter;

class TaskExport extends ParamConverter\LookupBase
{
    /**
     * @var Facade\Video
     */
    private $taskExportFacade;

    /**
     * @param Facade\TaskExport $taskExportFacade
     */
    public function __construct(Facade\TaskExport $taskExportFacade)
    {
        $this->taskExportFacade = $taskExportFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\TaskExport::class;
    }

    protected function resolveParameter($id)
    {
        return $this->taskExportFacade->find($id);
    }
}
