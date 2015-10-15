<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Component\HttpFoundation;

/**
 * @Configuration\Route("/", service="annostation.labeling_api.controller.default", defaults={"_format"="json"})
 */
class DefaultController extends Base
{
    /**
     * @Configuration\Route("/")
     */
    public function indexAction(HttpFoundation\Request $request)
    {
        return array('Hello' => 'World');
    }
}
