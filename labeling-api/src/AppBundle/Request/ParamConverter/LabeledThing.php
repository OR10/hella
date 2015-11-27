<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\HttpFoundation;

class LabeledThing implements ParamConverter\ParamConverterInterface
{
    /**
     * @var Facade\LabeledThing
     */
    private $labeledThingFacade;

    /**
     * @param Facade\LabeledThing $labeledThingFacade
     */
    public function __construct(Facade\LabeledThing $labeledThingFacade)
    {
        $this->labeledThingFacade = $labeledThingFacade;
    }

    public function apply(HttpFoundation\Request $request, Configuration\ParamConverter $configuration)
    {
        $param = $configuration->getName();

        if (!$request->attributes->has($param)) {
            return false;
        }

        $id = $request->attributes->get($param);

        if (($labeledThing = $this->labeledThingFacade->find($id)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        $request->attributes->set($param, $labeledThing);

        return true;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        if ($configuration->getClass() === null) {
            return false;
        }

        return $configuration->getClass() === Model\LabeledThing::class;
    }
}
