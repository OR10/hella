<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\HttpFoundation;

abstract class LookupBase implements ParamConverter\ParamConverterInterface
{
    public function apply(HttpFoundation\Request $request, Configuration\ParamConverter $configuration)
    {
        $param = $configuration->getName();

        if (!$request->attributes->has($param)) {
            return false;
        }

        if (($id = $request->attributes->get($param)) === null) {
            if ($configuration->isOptional()) {
                return true;
            }

            throw new Exception\BadRequestHttpException();
        }

        if (($resolvedParameter = $this->resolveParameter($id)) === null) {
            if (!$configuration->isOptional()) {
                throw new Exception\NotFoundHttpException();
            }
            $request->attributes->set(sprintf("_unresolved%sId", ucfirst($param)), $id);
        }

        $request->attributes->set($param, $resolvedParameter);

        return true;
    }

    /**
     * Overwrite this method in derived classes in order to actually resolve
     * the parameter with the given `$id`.
     *
     * @param mixed $id
     *
     * @return mixed
     */
    abstract protected function resolveParameter($id);
}
