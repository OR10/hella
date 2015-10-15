<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Component\HttpFoundation;

/**
 * @Configuration\Route("/api", service="annostation.labeling_api.controller.api", defaults={"_format"="json"})
 */
class ApiController extends Base
{
    /**
     * @Configuration\Route("/")
     * @Configuration\Route("/index.{_format}")
     */
    public function indexAction(HttpFoundation\Request $request)
    {
        return array('Hello' => 'World Api');
    }
}
