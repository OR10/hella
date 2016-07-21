<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

class LabelingGroup extends LookupBase
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
