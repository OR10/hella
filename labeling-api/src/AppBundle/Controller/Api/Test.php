<?php

namespace AppBundle\Controller\Api;

use AppBundle\Annotations\CloseSession;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;
use AppBundle\Controller;
use AppBundle\View;

/**
 * Simple test controller to check the various return types and their proper
 * handling/serialization.
 *
 * A controller is allowed to return any data type that can be serialized by
 * the serializer.
 *
 * @Rest\Prefix("/api/test")
 * @Rest\Route(service="annostation.labeling_api.controller.api.test")
 *
 * @CloseSession
 */
class Test extends Controller\Base
{
    /**
     * @Rest\Get("/array")
     */
    public function arrayAction()
    {
        return ['foo' => 'bar'];
    }

    /**
     * @Rest\Get("/view")
     */
    public function viewAction()
    {
        return View\View::create([
            'data' => 'some data from a view',
        ]);
    }
}
