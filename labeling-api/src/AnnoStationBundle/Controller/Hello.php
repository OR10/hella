<?php

namespace AnnoStationBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation;

/**
 * @Configuration\Route("/api/hello")
 */
class Hello extends Controller
{
    /**
     * @Configuration\Route("/annostation")
     *
     * @return HttpFoundation\Response
     */
    public function helloAction()
    {
        return new HttpFoundation\Response('hello annostation');
    }
}
