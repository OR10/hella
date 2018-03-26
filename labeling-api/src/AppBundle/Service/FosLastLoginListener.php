<?php

namespace AppBundle\Service;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class FosLastLoginListener implements EventSubscriberInterface
{
    public static function getSubscribedEvents()
    {
        return [];
    }
}
