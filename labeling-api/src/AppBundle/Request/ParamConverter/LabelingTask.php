<?php

namespace AppBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class LabelingTask extends LookupBase
{
    /**
     * @var Facade\LabelingTask
     */
    private $labelingTaskFacade;

    /**
     * @param Facade\LabelingTask $labelingTaskFacade
     */
    public function __construct(Facade\LabelingTask $labelingTaskFacade)
    {
        $this->labelingTaskFacade = $labelingTaskFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\LabelingTask::class;
    }

    protected function resolveParameter($id)
    {
        return $this->labelingTaskFacade->find($id);
    }
}
