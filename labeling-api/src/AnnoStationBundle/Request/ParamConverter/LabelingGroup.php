<?php

namespace AnnoStationBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AppBundle\Request\ParamConverter;

class LabelingGroup extends ParamConverter\LookupBase
{
    /**
     * @var Facade\LabelingGroup
     */
    private $labelingGroup;


    /**
     * @param Facade\LabelingGroup $labelingGroup
     */
    public function __construct(Facade\LabelingGroup $labelingGroup)
    {
        $this->labelingGroup = $labelingGroup;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\LabelingGroup::class;
    }

    protected function resolveParameter($id)
    {
        return $this->labelingGroup->find($id);
    }
}
