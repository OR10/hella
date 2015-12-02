<?php
namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Session;

abstract class Base
{
    /**
     * @var Session\SessionInterface
     */
    private $session;

    /**
     * @param Session\SessionInterface
     */
    public function setSession(Session\SessionInterface $session = null)
    {
        $this->session = $session;
    }

    /**
     * Save and close the current session to allow subsequent requests to start
     * while the current request is still being processed.
     */
    public function closeSession()
    {
        if ($this->session !== null) {
            $this->session->save();
        }
    }
}
