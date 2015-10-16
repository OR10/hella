<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Bridge\Twig;
use Symfony\Component\HttpFoundation;
use Symfony\Component\HttpFoundation\Response;

/**
 * @Configuration\Route("/", service="annostation.labeling_api.controller.index")
 */
class Index extends Base
{
    /**
     * @var TwigEngine
     */
    private $twigEngine;

    function __construct(Twig\TwigEngine $twigEngine)
    {
        $this->twigEngine = $twigEngine;
    }

    /**
     * @Configuration\Route("/")
     */
    public function indexAction(HttpFoundation\Request $request)
    {
        return new Response(
            $this->twigEngine->render(
                'AppBundle:default:index.html.twig'
            )
        );
    }
}
