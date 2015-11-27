<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\HttpFoundation;

class LabeledThingInFrame implements ParamConverter\ParamConverterInterface
{
    /**
     * @var Facade\LabeledThingInFrame
     */
    private $labeledThingInFrameFacade;

    /**
     * @param Facade\LabeledThingInFrame $labeledThingInFrameFacade
     */
    public function __construct(Facade\LabeledThingInFrame $labeledThingInFrameFacade)
    {
        $this->labeledThingInFrameFacade = $labeledThingInFrameFacade;
    }

    public function apply(HttpFoundation\Request $request, Configuration\ParamConverter $configuration)
    {
        $param = $configuration->getName();

        if (!$request->attributes->has($param)) {
            return false;
        }

        $id = $request->attributes->get($param);

        if (($labeledThingInFrame = $this->labeledThingInFrameFacade->find($id)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        $request->attributes->set($param, $labeledThingInFrame);

        return true;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        if ($configuration->getClass() === null) {
            return false;
        }

        return $configuration->getClass() === Model\LabeledThingInFrame::class;
    }
}
