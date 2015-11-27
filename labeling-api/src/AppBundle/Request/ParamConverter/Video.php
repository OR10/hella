<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\HttpFoundation;

class Video implements ParamConverter\ParamConverterInterface
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

    public function apply(HttpFoundation\Request $request, Configuration\ParamConverter $configuration)
    {
        $param = $configuration->getName();

        if (!$request->attributes->has($param)) {
            return false;
        }

        $id = $request->attributes->get($param);

        if (($video = $this->videoFacade->find($id)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        $request->attributes->set($param, $video);

        return true;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        if ($configuration->getClass() === null) {
            return false;
        }

        return $configuration->getClass() === Model\Video::class;
    }
}
