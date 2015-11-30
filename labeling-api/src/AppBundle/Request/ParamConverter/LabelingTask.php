<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\HttpFoundation;

class LabelingTask implements ParamConverter\ParamConverterInterface
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

    public function apply(HttpFoundation\Request $request, Configuration\ParamConverter $configuration)
    {
        $param = $configuration->getName();

        if (!$request->attributes->has($param)) {
            return false;
        }

        $id = $request->attributes->get($param);

        if (($labelingTask = $this->labelingTaskFacade->find($id)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        $request->attributes->set($param, $labelingTask);

        return true;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        if ($configuration->getClass() === null) {
            return false;
        }

        return $configuration->getClass() === Model\LabelingTask::class;
    }
}
