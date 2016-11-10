<?php

namespace AppBundle\Worker\EventHandler;

use crosscan\WorkerPool\Job;
use crosscan\WorkerPool\EventHandler;
use Doctrine\Common\Persistence\ObjectManager;

class DoctrineIdentityMapReset extends EventHandler\NoOp
{
    /**
     * @var ObjectManager
     */
    private $objectManager;

    /**
     * DoctrineIdentityMapReset constructor.
     *
     * @param ObjectManager $objectManager
     */
    public function __construct(ObjectManager $objectManager)
    {

        $this->objectManager = $objectManager;
    }

    function jobFinished(Job $job)
    {
        $this->objectManager->clear();
    }
}
