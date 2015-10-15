<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Component\HttpFoundation;
use FOS\RestBundle\Controller\Annotations as Rest;

/**
 * @Rest\Route("/", service="annostation.labeling_api.controller.api")
 */
class ApiController extends Base
{
    /**
     * @Rest\Get("/get.{_format}")
     */
    public function getAction(HttpFoundation\Request $request)
    {
        return array('Hello' => 'World Api');
    }
}
