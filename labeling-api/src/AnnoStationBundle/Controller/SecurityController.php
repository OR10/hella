<?php

namespace AnnoStationBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use AppBundle\Annotations\CloseSession;
use Sensio\Bundle\FrameworkExtraBundle\Configuration;

/**
 * @Configuration\Route("/", service="annostation.labeling_api.controller.auth")
 *
 * @CloseSession
 */
class SecurityController extends Controller
{

    /**
     * @Configuration\Route("/login_check", methods={"POST"})
     */
    public function loginCheckAction()
    {

    }

    /**
     * @Route("/logout", name="logout", methods={"POST"})
     */
    public function logoutAction()
    {

    }
}
