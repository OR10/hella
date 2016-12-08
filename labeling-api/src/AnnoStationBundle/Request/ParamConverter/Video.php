<?php

namespace AnnoStationBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AppBundle\Request\ParamConverter;

class Video extends ParamConverter\LookupBase
{
    /**
     * @var Facade\Video
     */
    private $videoFacade;

    /**
     * @param Facade\Video $videoFacade
     */
    public function __construct(Facade\Video $videoFacade)
    {
        $this->videoFacade = $videoFacade;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\Video::class;
    }

    protected function resolveParameter($id)
    {
        return $this->videoFacade->find($id);
    }
}
