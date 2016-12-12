<?php

namespace AnnoStationBundle\Request\ParamConverter;

use AnnoStationBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use AppBundle\Request\ParamConverter;

class TaskConfiguration extends ParamConverter\LookupBase
{
    /**
     * @var Facade\TaskConfiguration
     */
    private $taskConfiguration;

    /**
     * @param Facade\TaskConfiguration $taskConfiguration
     */
    public function __construct(Facade\TaskConfiguration $taskConfiguration)
    {
        $this->taskConfiguration = $taskConfiguration;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        return $configuration->getClass() === Model\TaskConfiguration::class;
    }

    protected function resolveParameter($id)
    {
        return $this->taskConfiguration->find($id);
    }
}
