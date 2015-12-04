<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class TaskExport extends LookupBase
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
