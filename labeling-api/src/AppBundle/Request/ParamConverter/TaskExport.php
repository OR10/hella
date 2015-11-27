<?php

namespace AppBundle\Request\ParamConverter;

use AppBundle\Database\Facade;
use AppBundle\Model;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Sensio\Bundle\FrameworkExtraBundle\Request\ParamConverter;
use Symfony\Component\HttpKernel\Exception;
use Symfony\Component\HttpFoundation;

class TaskExport implements ParamConverter\ParamConverterInterface
{
    /**
     * @var Facade\Video
     */
    private $taskExportFacade;

    /**
     * @param Facade\TaskExport $taskExportFacade
     */
    public function __construct(Facade\TaskExport $taskExportFacade)
    {
        $this->taskExportFacade = $taskExportFacade;
    }

    public function apply(HttpFoundation\Request $request, Configuration\ParamConverter $configuration)
    {
        $param = $configuration->getName();

        if (!$request->attributes->has($param)) {
            return false;
        }

        $id = $request->attributes->get($param);

        if (($taskExport = $this->taskExportFacade->find($id)) === null) {
            throw new Exception\NotFoundHttpException();
        }

        $request->attributes->set($param, $taskExport);

        return true;
    }

    public function supports(Configuration\ParamConverter $configuration)
    {
        if ($configuration->getClass() === null) {
            return false;
        }

        return $configuration->getClass() === Model\TaskExport::class;
    }
}
